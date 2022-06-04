import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateEntranceDto {
  @IsNotEmpty()
  name!: string;
}

export class UpdateEntranceDto {
  @IsOptional()
  @IsNotEmpty()
  name?: string;
}
