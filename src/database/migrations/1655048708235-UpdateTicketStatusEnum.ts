import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateTicketStatusEnum1655048708235 implements MigrationInterface {
  name = 'UpdateTicketStatusEnum1655048708235';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."tickets_status_enum" RENAME TO "tickets_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."tickets_status_enum" AS ENUM('active', 'completed')`,
    );
    await queryRunner.query(
      `ALTER TABLE "tickets" ALTER COLUMN "status" TYPE "public"."tickets_status_enum" USING "status"::"text"::"public"."tickets_status_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."tickets_status_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."tickets_status_enum_old" AS ENUM('active', 'Completed')`,
    );
    await queryRunner.query(
      `ALTER TABLE "tickets" ALTER COLUMN "status" TYPE "public"."tickets_status_enum_old" USING "status"::"text"::"public"."tickets_status_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."tickets_status_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."tickets_status_enum_old" RENAME TO "tickets_status_enum"`,
    );
  }
}
