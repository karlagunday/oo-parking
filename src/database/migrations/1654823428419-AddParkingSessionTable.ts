import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddParkingSessionTable1654823428419 implements MigrationInterface {
  name = 'AddParkingSessionTable1654823428419';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."parking_sessions_status_enum" AS ENUM('STARTED', 'ENDED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "parking_sessions" ("createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "startedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "endedAt" TIMESTAMP WITH TIME ZONE, "ticketId" uuid NOT NULL, "entranceId" uuid NOT NULL, "spaceId" uuid NOT NULL, "status" "public"."parking_sessions_status_enum" NOT NULL, CONSTRAINT "PK_3e965188d8b19a33232c3972b22" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "parking_sessions" ADD CONSTRAINT "FK_287e2090f8e6306608fea5a7bdf" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "parking_sessions" ADD CONSTRAINT "FK_421cc0906751ba431590e2548e6" FOREIGN KEY ("entranceId") REFERENCES "entrances"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "parking_sessions" ADD CONSTRAINT "FK_89b263f64f316e69993ff79afe2" FOREIGN KEY ("spaceId") REFERENCES "spaces"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "parking_sessions" DROP CONSTRAINT "FK_89b263f64f316e69993ff79afe2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "parking_sessions" DROP CONSTRAINT "FK_421cc0906751ba431590e2548e6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "parking_sessions" DROP CONSTRAINT "FK_287e2090f8e6306608fea5a7bdf"`,
    );
    await queryRunner.query(`DROP TABLE "parking_sessions"`);
    await queryRunner.query(
      `DROP TYPE "public"."parking_sessions_status_enum"`,
    );
  }
}
