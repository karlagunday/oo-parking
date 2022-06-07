import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateTicketCompletedFieldFormat1654527377963
  implements MigrationInterface
{
  name = 'UpdateTicketCompletedFieldFormat1654527377963';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tickets" DROP COLUMN "completedAt"`);
    await queryRunner.query(
      `ALTER TABLE "tickets" ADD "completedAt" TIMESTAMP WITH TIME ZONE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tickets" DROP COLUMN "completedAt"`);
    await queryRunner.query(
      `ALTER TABLE "tickets" ADD "completedAt" TIMESTAMP`,
    );
  }
}
