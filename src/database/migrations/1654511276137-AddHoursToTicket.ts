import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddHoursToTicket1654511276137 implements MigrationInterface {
  name = 'AddHoursToTicket1654511276137';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tickets" ADD "hours" double precision NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tickets" DROP COLUMN "hours"`);
  }
}
