import { MigrationInterface, QueryRunner } from "typeorm";

export class ClienteNotnullIndices1759077696930 implements MigrationInterface {
    name = 'ClienteNotnullIndices1759077696930'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX "idx_cliente_nit" ON "cliente" ("nit") `);
        await queryRunner.query(`CREATE INDEX "idx_cliente_correo" ON "cliente" ("correo") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."idx_cliente_correo"`);
        await queryRunner.query(`DROP INDEX "public"."idx_cliente_nit"`);
    }

}
