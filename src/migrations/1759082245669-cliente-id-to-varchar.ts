import { MigrationInterface, QueryRunner } from "typeorm";

export class ClienteIdToVarchar1759082245669 implements MigrationInterface {
  name = 'ClienteIdToVarchar1759082245669';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Quitar default si la columna lo tiene (por uuid_generate_v4 o similar)
    await queryRunner.query(`
      ALTER TABLE "cliente"
      ALTER COLUMN "id" DROP DEFAULT
    `);

    // Cambiar tipo uuid -> varchar(50) sin perder datos
    await queryRunner.query(`
      ALTER TABLE "cliente"
      ALTER COLUMN "id" TYPE varchar(50)
      USING "id"::text
    `);

    // Si existía un check de longitud (por migraciones previas), eliminarlo
    await queryRunner.query(`
      ALTER TABLE "cliente"
      DROP CONSTRAINT IF EXISTS "cliente_id_len_chk"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // ⚠️ Esto fallará si hay IDs no-UUID (por ejemplo, ULIDs)
    await queryRunner.query(`
      ALTER TABLE "cliente"
      ALTER COLUMN "id" TYPE uuid
      USING "id"::uuid
    `);
  }
}
