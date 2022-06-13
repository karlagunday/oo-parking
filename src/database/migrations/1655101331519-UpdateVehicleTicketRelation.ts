import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateVehicleTicketRelation1655101331519
  implements MigrationInterface
{
  name = 'UpdateVehicleTicketRelation1655101331519';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "vehicles" DROP CONSTRAINT "FK_0b041f3e2628114d20bf9ea6949"`,
    );
    await queryRunner.query(`ALTER TABLE "vehicles" DROP COLUMN "ticketsId"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "vehicles" ADD "ticketsId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "vehicles" ADD CONSTRAINT "FK_0b041f3e2628114d20bf9ea6949" FOREIGN KEY ("ticketsId") REFERENCES "tickets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
