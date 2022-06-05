import { IsUUID } from 'class-validator';

export class ParkVehicleDto {
  @IsUUID()
  entranceId: string;
}
