import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTicketEntity1654501181705 implements MigrationInterface {
    name = 'AddTicketEntity1654501181705'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."tickets_status_enum" AS ENUM('active', 'Completed')`);
        await queryRunner.query(`CREATE TABLE "tickets" ("createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "number" SERIAL NOT NULL, "status" "public"."tickets_status_enum" NOT NULL, "vehicleId" uuid NOT NULL, "cost" double precision NOT NULL DEFAULT '0', CONSTRAINT "PK_343bc942ae261cf7a1377f48fd0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "vehicles" ADD "ticketsId" uuid`);
        await queryRunner.query(`ALTER TABLE "activity_logs" ADD "ticketId" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "vehicles" ADD CONSTRAINT "FK_0b041f3e2628114d20bf9ea6949" FOREIGN KEY ("ticketsId") REFERENCES "tickets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tickets" ADD CONSTRAINT "FK_0b04f89eaea4019293c5b174343" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "activity_logs" ADD CONSTRAINT "FK_5bd85ee54aad276b74826d9c74c" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "activity_logs" DROP CONSTRAINT "FK_5bd85ee54aad276b74826d9c74c"`);
        await queryRunner.query(`ALTER TABLE "tickets" DROP CONSTRAINT "FK_0b04f89eaea4019293c5b174343"`);
        await queryRunner.query(`ALTER TABLE "vehicles" DROP CONSTRAINT "FK_0b041f3e2628114d20bf9ea6949"`);
        await queryRunner.query(`ALTER TABLE "activity_logs" DROP COLUMN "ticketId"`);
        await queryRunner.query(`ALTER TABLE "vehicles" DROP COLUMN "ticketsId"`);
        await queryRunner.query(`DROP TABLE "tickets"`);
        await queryRunner.query(`DROP TYPE "public"."tickets_status_enum"`);
    }

}
