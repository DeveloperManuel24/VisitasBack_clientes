import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchema1761189961507 implements MigrationInterface {
    name = 'InitSchema1761189961507'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "evento_visita" DROP CONSTRAINT "fk_evento_visita_visita"`);
        await queryRunner.query(`ALTER TABLE "evidencia" DROP CONSTRAINT "fk_evidencia_visita"`);
        await queryRunner.query(`ALTER TABLE "visita" DROP CONSTRAINT "fk_visita_cliente"`);
        await queryRunner.query(`ALTER TABLE "visita" DROP CONSTRAINT "fk_visita_supervisor"`);
        await queryRunner.query(`ALTER TABLE "visita" DROP CONSTRAINT "fk_visita_tecnico"`);
        await queryRunner.query(`DROP INDEX "public"."idx_visita_scheduled"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8cf7af991331d15d6ce1b104e4"`);
        await queryRunner.query(`ALTER TABLE "cliente" ALTER COLUMN "direccion" SET NOT NULL`);
        await queryRunner.query(`ALTER TYPE "public"."evidencia_tipo_enum" RENAME TO "evidencia_tipo_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."evidencia_tipo_enum" AS ENUM('FOTO', 'VIDEO', 'AUDIO', 'DOCUMENTO', 'FIRMA')`);
        await queryRunner.query(`ALTER TABLE "evidencia" ALTER COLUMN "tipo" TYPE "public"."evidencia_tipo_enum" USING "tipo"::"text"::"public"."evidencia_tipo_enum"`);
        await queryRunner.query(`DROP TYPE "public"."evidencia_tipo_enum_old"`);
        await queryRunner.query(`ALTER TABLE "evidencia" DROP COLUMN "descripcion"`);
        await queryRunner.query(`ALTER TABLE "evidencia" ADD "descripcion" character varying(500)`);
        await queryRunner.query(`ALTER TABLE "visita" ALTER COLUMN "supervisorId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "visita" ALTER COLUMN "tecnicoId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TYPE "public"."visita_estado_enum" RENAME TO "visita_estado_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."visita_estado_enum" AS ENUM('PENDIENTE', 'EN_CURSO', 'COMPLETADA', 'CANCELADA')`);
        await queryRunner.query(`ALTER TABLE "visita" ALTER COLUMN "estado" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "visita" ALTER COLUMN "estado" TYPE "public"."visita_estado_enum" USING "estado"::"text"::"public"."visita_estado_enum"`);
        await queryRunner.query(`ALTER TABLE "visita" ALTER COLUMN "estado" SET DEFAULT 'PENDIENTE'`);
        await queryRunner.query(`DROP TYPE "public"."visita_estado_enum_old"`);
        await queryRunner.query(`ALTER TABLE "visita" DROP COLUMN "notaSupervisor"`);
        await queryRunner.query(`ALTER TABLE "visita" ADD "notaSupervisor" character varying(1000)`);
        await queryRunner.query(`ALTER TABLE "visita" DROP COLUMN "notaTecnico"`);
        await queryRunner.query(`ALTER TABLE "visita" ADD "notaTecnico" character varying(1000)`);
        await queryRunner.query(`CREATE INDEX "IDX_8cf7af991331d15d6ce1b104e4" ON "cliente" ("nombre", "direccion") `);
        await queryRunner.query(`CREATE INDEX "idx_visita_scheduled_at" ON "visita" ("scheduledAt") `);
        await queryRunner.query(`ALTER TABLE "evento_visita" ADD CONSTRAINT "FK_58e428f01c34cedd8941258bf32" FOREIGN KEY ("visitaId") REFERENCES "visita"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "evidencia" ADD CONSTRAINT "FK_d57d40b4bb318d0cb3e6abfef92" FOREIGN KEY ("visitaId") REFERENCES "visita"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "visita" ADD CONSTRAINT "FK_e40f944c5f494195533ace5e966" FOREIGN KEY ("clienteId") REFERENCES "cliente"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "visita" ADD CONSTRAINT "FK_13a46ec86c49b16b8cc7a9e131f" FOREIGN KEY ("supervisorId") REFERENCES "usuario"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "visita" ADD CONSTRAINT "FK_9fc70d859858006d40283ac4551" FOREIGN KEY ("tecnicoId") REFERENCES "usuario"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "visita" DROP CONSTRAINT "FK_9fc70d859858006d40283ac4551"`);
        await queryRunner.query(`ALTER TABLE "visita" DROP CONSTRAINT "FK_13a46ec86c49b16b8cc7a9e131f"`);
        await queryRunner.query(`ALTER TABLE "visita" DROP CONSTRAINT "FK_e40f944c5f494195533ace5e966"`);
        await queryRunner.query(`ALTER TABLE "evidencia" DROP CONSTRAINT "FK_d57d40b4bb318d0cb3e6abfef92"`);
        await queryRunner.query(`ALTER TABLE "evento_visita" DROP CONSTRAINT "FK_58e428f01c34cedd8941258bf32"`);
        await queryRunner.query(`DROP INDEX "public"."idx_visita_scheduled_at"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8cf7af991331d15d6ce1b104e4"`);
        await queryRunner.query(`ALTER TABLE "visita" DROP COLUMN "notaTecnico"`);
        await queryRunner.query(`ALTER TABLE "visita" ADD "notaTecnico" character varying(500)`);
        await queryRunner.query(`ALTER TABLE "visita" DROP COLUMN "notaSupervisor"`);
        await queryRunner.query(`ALTER TABLE "visita" ADD "notaSupervisor" character varying(500)`);
        await queryRunner.query(`CREATE TYPE "public"."visita_estado_enum_old" AS ENUM('PENDIENTE', 'EN_PROGRESO', 'COMPLETADA', 'CANCELADA', 'EN_CURSO')`);
        await queryRunner.query(`ALTER TABLE "visita" ALTER COLUMN "estado" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "visita" ALTER COLUMN "estado" TYPE "public"."visita_estado_enum_old" USING "estado"::"text"::"public"."visita_estado_enum_old"`);
        await queryRunner.query(`ALTER TABLE "visita" ALTER COLUMN "estado" SET DEFAULT 'PENDIENTE'`);
        await queryRunner.query(`DROP TYPE "public"."visita_estado_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."visita_estado_enum_old" RENAME TO "visita_estado_enum"`);
        await queryRunner.query(`ALTER TABLE "visita" ALTER COLUMN "tecnicoId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "visita" ALTER COLUMN "supervisorId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "evidencia" DROP COLUMN "descripcion"`);
        await queryRunner.query(`ALTER TABLE "evidencia" ADD "descripcion" character varying(400)`);
        await queryRunner.query(`CREATE TYPE "public"."evidencia_tipo_enum_old" AS ENUM('FOTO', 'VIDEO', 'ARCHIVO')`);
        await queryRunner.query(`ALTER TABLE "evidencia" ALTER COLUMN "tipo" TYPE "public"."evidencia_tipo_enum_old" USING "tipo"::"text"::"public"."evidencia_tipo_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."evidencia_tipo_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."evidencia_tipo_enum_old" RENAME TO "evidencia_tipo_enum"`);
        await queryRunner.query(`ALTER TABLE "cliente" ALTER COLUMN "direccion" DROP NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_8cf7af991331d15d6ce1b104e4" ON "cliente" ("direccion", "nombre") `);
        await queryRunner.query(`CREATE INDEX "idx_visita_scheduled" ON "visita" ("scheduledAt") `);
        await queryRunner.query(`ALTER TABLE "visita" ADD CONSTRAINT "fk_visita_tecnico" FOREIGN KEY ("tecnicoId") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "visita" ADD CONSTRAINT "fk_visita_supervisor" FOREIGN KEY ("supervisorId") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "visita" ADD CONSTRAINT "fk_visita_cliente" FOREIGN KEY ("clienteId") REFERENCES "cliente"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "evidencia" ADD CONSTRAINT "fk_evidencia_visita" FOREIGN KEY ("visitaId") REFERENCES "visita"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "evento_visita" ADD CONSTRAINT "fk_evento_visita_visita" FOREIGN KEY ("visitaId") REFERENCES "visita"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
