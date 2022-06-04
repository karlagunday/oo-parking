import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { SpaceSize } from '../space.types';
import { CreateSpaceDto } from './create-space.dto';

export class UpdateSpaceDto extends PartialType(CreateSpaceDto) {
  @IsOptional()
  @IsNotEmpty()
  name!: string;

  @IsEnum(SpaceSize)
  size!: SpaceSize;
}
