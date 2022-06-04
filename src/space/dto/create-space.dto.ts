import { IsEnum, IsNotEmpty } from 'class-validator';
import { SpaceSize } from '../space.types';

export class CreateSpaceDto {
  @IsNotEmpty()
  name!: string;

  @IsEnum(SpaceSize)
  size!: SpaceSize;
}
