import { MigrationInterface, QueryRunner } from "typeorm";

export class Visitas1760291947457 implements MigrationInterface {
  public readonly name = 'Visitas1760291947457';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ===== Enums =====
    await queryRunner.query(`DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'visita_estado_enum') THEN
        CREATE TYPE "public"."visita_estado_enum" AS ENUM ('PENDIENTE', 'EN_PROGRESO', 'COMPLETADA', 'CANCELADA');
      END IF;
    END $$;`);

    await queryRunner.query(`DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'evento_visita_tipo_enum') THEN
        CREATE TYPE "public"."evento_visita_tipo_enum" AS ENUM ('CREADA', 'ASIGNADA', 'REPROGRAMADA', 'CHECK_IN', 'CHECK_OUT', 'CERRADA', 'CANCELADA');
      END IF;
    END $$;`);

    await queryRunner.query(`DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'evidencia_tipo_enum') THEN
        CREATE TYPE "public"."evidencia_tipo_enum" AS ENUM ('FOTO', 'VIDEO', 'ARCHIVO');
      END IF;
    END $$;`);

    // ===== Tabla VISITA =====
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "visita" (
        "id"            varchar(50) PRIMARY KEY,
        "clienteId"     varchar(50) NOT NULL,
        "supervisorId"  varchar(50) NOT NULL,
        "tecnicoId"     varchar(50) NOT NULL,
        "scheduledAt"   timestamptz NOT NULL,
        "estado"        "public"."visita_estado_enum" NOT NULL DEFAULT 'PENDIENTE',
        "checkInAt"     timestamptz,
        "checkInLat"    decimal(9,6),
        "checkInLng"    decimal(9,6),
        "checkOutAt"    timestamptz,
        "checkOutLat"   decimal(9,6),
        "checkOutLng"   decimal(9,6),
        "notaSupervisor" varchar(500),
        "notaTecnico"    varchar(500),
        "duracionMin"    integer,
        "creadoEn"       timestamptz NOT NULL DEFAULT now(),
        "actualizadoEn"  timestamptz NOT NULL DEFAULT now(),
        "eliminadoEn"    timestamptz
      );
    `);

    // Índices VISITA
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_visita_cliente"    ON "visita" ("clienteId");`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_visita_supervisor" ON "visita" ("supervisorId");`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_visita_tecnico"    ON "visita" ("tecnicoId");`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_visita_estado"     ON "visita" ("estado");`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_visita_scheduled"  ON "visita" ("scheduledAt");`);

    // FKs VISITA (cliente/usuario están como varchar(50) en este microservicio)
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'fk_visita_cliente'
        ) THEN
          ALTER TABLE "visita"
          ADD CONSTRAINT "fk_visita_cliente"
          FOREIGN KEY ("clienteId") REFERENCES "cliente"("id")
          ON DELETE RESTRICT ON UPDATE NO ACTION;
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'fk_visita_supervisor'
        ) THEN
          ALTER TABLE "visita"
          ADD CONSTRAINT "fk_visita_supervisor"
          FOREIGN KEY ("supervisorId") REFERENCES "usuario"("id")
          ON DELETE RESTRICT ON UPDATE NO ACTION;
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'fk_visita_tecnico'
        ) THEN
          ALTER TABLE "visita"
          ADD CONSTRAINT "fk_visita_tecnico"
          FOREIGN KEY ("tecnicoId") REFERENCES "usuario"("id")
          ON DELETE RESTRICT ON UPDATE NO ACTION;
        END IF;
      END $$;
    `);

    // ===== Tabla EVENTO_VISITA =====
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "evento_visita" (
        "id"         varchar(50) PRIMARY KEY,
        "visitaId"   varchar(50) NOT NULL,
        "tipo"       "public"."evento_visita_tipo_enum" NOT NULL,
        "timestamp"  timestamptz NOT NULL DEFAULT now(),
        "meta"       jsonb
      );
    `);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_evento_visita_visita" ON "evento_visita" ("visitaId");`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_evento_visita_tipo"   ON "evento_visita" ("tipo");`);

    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'fk_evento_visita_visita'
        ) THEN
          ALTER TABLE "evento_visita"
          ADD CONSTRAINT "fk_evento_visita_visita"
          FOREIGN KEY ("visitaId") REFERENCES "visita"("id")
          ON DELETE CASCADE ON UPDATE NO ACTION;
        END IF;
      END $$;
    `);

    // ===== Tabla EVIDENCIA =====
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "evidencia" (
        "id"          varchar(50) PRIMARY KEY,
        "visitaId"    varchar(50) NOT NULL,
        "tipo"        "public"."evidencia_tipo_enum" NOT NULL,
        "url"         varchar(500) NOT NULL,
        "descripcion" varchar(400),
        "creadoEn"    timestamptz NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_evidencia_visita" ON "evidencia" ("visitaId");`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_evidencia_tipo"   ON "evidencia" ("tipo");`);

    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'fk_evidencia_visita'
        ) THEN
          ALTER TABLE "evidencia"
          ADD CONSTRAINT "fk_evidencia_visita"
          FOREIGN KEY ("visitaId") REFERENCES "visita"("id")
          ON DELETE CASCADE ON UPDATE NO ACTION;
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // El orden inverso: primero dependientes
    // EVIDENCIA
    await queryRunner.query(`ALTER TABLE "evidencia" DROP CONSTRAINT IF EXISTS "fk_evidencia_visita";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_evidencia_tipo";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_evidencia_visita";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "evidencia";`);
    await queryRunner.query(`DO $$ BEGIN
      IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'evidencia_tipo_enum') THEN
        DROP TYPE "public"."evidencia_tipo_enum";
      END IF;
    END $$;`);

    // EVENTO_VISITA
    await queryRunner.query(`ALTER TABLE "evento_visita" DROP CONSTRAINT IF EXISTS "fk_evento_visita_visita";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_evento_visita_tipo";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_evento_visita_visita";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "evento_visita";`);
    await queryRunner.query(`DO $$ BEGIN
      IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'evento_visita_tipo_enum') THEN
        DROP TYPE "public"."evento_visita_tipo_enum";
      END IF;
    END $$;`);

    // VISITA
    await queryRunner.query(`ALTER TABLE "visita" DROP CONSTRAINT IF EXISTS "fk_visita_tecnico";`);
    await queryRunner.query(`ALTER TABLE "visita" DROP CONSTRAINT IF EXISTS "fk_visita_supervisor";`);
    await queryRunner.query(`ALTER TABLE "visita" DROP CONSTRAINT IF EXISTS "fk_visita_cliente";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_visita_scheduled";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_visita_estado";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_visita_tecnico";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_visita_supervisor";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_visita_cliente";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "visita";`);
    await queryRunner.query(`DO $$ BEGIN
      IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'visita_estado_enum') THEN
        DROP TYPE "public"."visita_estado_enum";
      END IF;
    END $$;`);
  }
}
