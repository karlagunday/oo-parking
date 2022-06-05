import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEntranceSpacesCompositeUnique1654404381823
  implements MigrationInterface
{
  name = 'AddEntranceSpacesCompositeUnique1654404381823';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "entrance_spaces" ADD CONSTRAINT "UQ_7c307d540023b46c59bc6b34494" UNIQUE ("spaceId", "entranceId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "entrance_spaces" DROP CONSTRAINT "UQ_7c307d540023b46c59bc6b34494"`,
    );
  }
}
