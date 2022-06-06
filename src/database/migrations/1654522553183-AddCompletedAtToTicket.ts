import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCompletedAtToTicket1654522553183 implements MigrationInterface {
  name = 'AddCompletedAtToTicket1654522553183';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tickets" ADD "completedAt" TIMESTAMP`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tickets" DROP COLUMN "completedAt"`);
  }
}
