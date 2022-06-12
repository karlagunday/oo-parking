import { MigrationInterface, QueryRunner } from 'typeorm';

export class Initial1654362703284 implements MigrationInterface {
  name = 'Initial1654362703284';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."spaces_size_enum" AS ENUM('SM', 'MD', 'LG')`,
    );
    await queryRunner.query(
      `CREATE TABLE "spaces" ("createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "size" "public"."spaces_size_enum" NOT NULL, CONSTRAINT "PK_dbe542974aca57afcb60709d4c8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "entrance_spaces" ("createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "spaceId" uuid NOT NULL, "entranceId" uuid NOT NULL, "distance" integer NOT NULL, CONSTRAINT "PK_4db3c8cd239dd0a9bbe8d761b36" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "entrances" ("createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, CONSTRAINT "PK_42084a4198f5ed4c46257702e9d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."vehicles_size_enum" AS ENUM('SM', 'MD', 'LG')`,
    );
    await queryRunner.query(
      `CREATE TABLE "vehicles" ("createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "plateNumber" character varying NOT NULL, "size" "public"."vehicles_size_enum" NOT NULL DEFAULT 'SM', CONSTRAINT "UQ_66ea96381a7a7ceb35c72f36625" UNIQUE ("plateNumber"), CONSTRAINT "PK_18d8646b59304dce4af3a9e35b6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "entrance_spaces" ADD CONSTRAINT "FK_036ec4024345e36a4a87089f694" FOREIGN KEY ("spaceId") REFERENCES "spaces"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "entrance_spaces" ADD CONSTRAINT "FK_ad128a92e973d5dfb976fe5a4fc" FOREIGN KEY ("entranceId") REFERENCES "entrances"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "entrance_spaces" DROP CONSTRAINT "FK_ad128a92e973d5dfb976fe5a4fc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "entrance_spaces" DROP CONSTRAINT "FK_036ec4024345e36a4a87089f694"`,
    );
    await queryRunner.query(`DROP TABLE "vehicles"`);
    await queryRunner.query(`DROP TYPE "public"."vehicles_size_enum"`);
    await queryRunner.query(`DROP TABLE "entrances"`);
    await queryRunner.query(`DROP TABLE "entrance_spaces"`);
    await queryRunner.query(`DROP TABLE "spaces"`);
    await queryRunner.query(`DROP TYPE "public"."spaces_size_enum"`);
  }
}
