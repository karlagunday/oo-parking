import { IsPositive, IsUUID } from 'class-validator';

export class AssignSpaceDto {
  @IsUUID()
  spaceId!: string;

  @IsPositive()
  distance!: number;
}
