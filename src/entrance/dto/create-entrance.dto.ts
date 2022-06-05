import { IsNotEmpty } from 'class-validator';

export class CreateEntranceDto {
  @IsNotEmpty()
  name!: string;
}
