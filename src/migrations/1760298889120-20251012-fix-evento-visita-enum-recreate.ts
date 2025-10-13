import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixEventoVisitaEnumRecreate1760298889120 implements MigrationInterface {
  name = 'FixEventoVisitaEnumRecreate1760298889120';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1) Crear un ENUM nuevo con TODOS los valores
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_type WHERE typname = 'evento_visita_tipo_enum_new'
        ) THEN
          CREATE TYPE "evento_visita_tipo_enum_new" AS ENUM (
            'CREADA',
            'ASIGNADA_SUPERVISOR',
            'ASIGNADA_TECNICO',
            'REPROGRAMADA',
            'CHECK_IN',
            'CHECK_OUT',
            'CANCELADA'
          );
        END IF;
      END
      $$;
    `);

    // 2) Cambiar la columna para usar el tipo nuevo
    await queryRunner.query(`
      ALTER TABLE "evento_visita"
      ALTER COLUMN "tipo" TYPE "evento_visita_tipo_enum_new"
      USING "tipo"::text::"evento_visita_tipo_enum_new";
    `);

    // 3) Borrar el tipo viejo (si existe) y renombrar el nuevo al nombre original
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'evento_visita_tipo_enum') THEN
          DROP TYPE "evento_visita_tipo_enum";
        END IF;
      END
      $$;
    `);

    await queryRunner.query(`
      ALTER TYPE "evento_visita_tipo_enum_new" RENAME TO "evento_visita_tipo_enum";
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // down simple: enum reducido (sin ASIGNADA_SUPERVISOR/ASIGNADA_TECNICO)
    await queryRunner.query(`
      CREATE TYPE "evento_visita_tipo_enum_old" AS ENUM (
        'CREADA',
        'REPROGRAMADA',
        'CHECK_IN',
        'CHECK_OUT',
        'CANCELADA'
      );
    `);

    await queryRunner.query(`
      ALTER TABLE "evento_visita"
      ALTER COLUMN "tipo" TYPE "evento_visita_tipo_enum_old"
      USING "tipo"::text::"evento_visita_tipo_enum_old";
    `);

    await queryRunner.query(`
      DROP TYPE "evento_visita_tipo_enum";
      ALTER TYPE "evento_visita_tipo_enum_old" RENAME TO "evento_visita_tipo_enum";
    `);
  }
}
