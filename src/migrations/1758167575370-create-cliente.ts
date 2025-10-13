import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCliente1758167575370 implements MigrationInterface {
    name = 'CreateCliente1758167575370'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "cliente" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nombre" character varying(120) NOT NULL, "direccion" character varying(200), "telefono" character varying(30), "correo" character varying(120), "lat" numeric(9,6), "lng" numeric(9,6), "nit" character varying(20), "creadoEn" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "actualizadoEn" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "eliminadoEn" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_18990e8df6cf7fe71b9dc0f5f39" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_8cf7af991331d15d6ce1b104e4" ON "cliente" ("nombre", "direccion") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_8cf7af991331d15d6ce1b104e4"`);
        await queryRunner.query(`DROP TABLE "cliente"`);
    }

}
