import { SpaceSize } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateSpaceDto {
  @IsNotEmpty()
  name!: string;

  @IsEnum(SpaceSize)
  size!: SpaceSize;
}

export class UpdateSpaceDto {
  @IsOptional()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsEnum(SpaceSize)
  size?: SpaceSize;
}
