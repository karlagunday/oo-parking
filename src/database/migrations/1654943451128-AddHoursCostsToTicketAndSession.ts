import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddHoursCostsToTicketAndSession1654943451128
  implements MigrationInterface
{
  name = 'AddHoursCostsToTicketAndSession1654943451128';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tickets" DROP COLUMN "cost"`);
    await queryRunner.query(`ALTER TABLE "tickets" DROP COLUMN "hours"`);
    await queryRunner.query(
      `ALTER TABLE "tickets" ADD "totalCost" double precision NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "tickets" ADD "actualHours" double precision NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "tickets" ADD "paidHours" double precision NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "tickets" ADD "remainingHours" double precision NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "parking_sessions" ADD "cost" double precision NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "parking_sessions" ADD "hours" double precision NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "parking_sessions" DROP COLUMN "hours"`,
    );
    await queryRunner.query(
      `ALTER TABLE "parking_sessions" DROP COLUMN "cost"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tickets" DROP COLUMN "remainingHours"`,
    );
    await queryRunner.query(`ALTER TABLE "tickets" DROP COLUMN "paidHours"`);
    await queryRunner.query(`ALTER TABLE "tickets" DROP COLUMN "actualHours"`);
    await queryRunner.query(`ALTER TABLE "tickets" DROP COLUMN "totalCost"`);
    await queryRunner.query(
      `ALTER TABLE "tickets" ADD "hours" double precision NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "tickets" ADD "cost" double precision NOT NULL DEFAULT '0'`,
    );
  }
}
