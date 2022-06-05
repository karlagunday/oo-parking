import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateSizeEnums1654423229701 implements MigrationInterface {
  name = 'UpdateSizeEnums1654423229701';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."spaces_size_enum" RENAME TO "spaces_size_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."spaces_size_enum" AS ENUM('1', '10', '20')`,
    );
    await queryRunner.query(
      `ALTER TABLE "spaces" ALTER COLUMN "size" TYPE "public"."spaces_size_enum" USING "size"::"text"::"public"."spaces_size_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."spaces_size_enum_old"`);
    await queryRunner.query(
      `ALTER TYPE "public"."vehicles_size_enum" RENAME TO "vehicles_size_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."vehicles_size_enum" AS ENUM('1', '10', '20')`,
    );
    await queryRunner.query(
      `ALTER TABLE "vehicles" ALTER COLUMN "size" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "vehicles" ALTER COLUMN "size" TYPE "public"."vehicles_size_enum" USING "size"::"text"::"public"."vehicles_size_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vehicles" ALTER COLUMN "size" SET DEFAULT '1'`,
    );
    await queryRunner.query(`DROP TYPE "public"."vehicles_size_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."vehicles_size_enum_old" AS ENUM('SM', 'MD', 'LG')`,
    );
    await queryRunner.query(
      `ALTER TABLE "vehicles" ALTER COLUMN "size" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "vehicles" ALTER COLUMN "size" TYPE "public"."vehicles_size_enum_old" USING "size"::"text"::"public"."vehicles_size_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vehicles" ALTER COLUMN "size" SET DEFAULT 'SM'`,
    );
    await queryRunner.query(`DROP TYPE "public"."vehicles_size_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."vehicles_size_enum_old" RENAME TO "vehicles_size_enum"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."spaces_size_enum_old" AS ENUM('SM', 'MD', 'LG')`,
    );
    await queryRunner.query(
      `ALTER TABLE "spaces" ALTER COLUMN "size" TYPE "public"."spaces_size_enum_old" USING "size"::"text"::"public"."spaces_size_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."spaces_size_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."spaces_size_enum_old" RENAME TO "spaces_size_enum"`,
    );
  }
}
