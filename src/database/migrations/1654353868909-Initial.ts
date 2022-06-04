import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1654353868909 implements MigrationInterface {
    name = 'Initial1654353868909'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."vehicle_size_enum" AS ENUM('SM', 'MD', 'LG')`);
        await queryRunner.query(`CREATE TABLE "vehicle" ("createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "plateNumber" character varying NOT NULL, "size" "public"."vehicle_size_enum" NOT NULL DEFAULT 'SM', CONSTRAINT "UQ_c435e4bb8a5f02587778084be57" UNIQUE ("plateNumber"), CONSTRAINT "PK_187fa17ba39d367e5604b3d1ec9" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "vehicle"`);
        await queryRunner.query(`DROP TYPE "public"."vehicle_size_enum"`);
    }

}
