import { IsEnum, IsNotEmpty } from 'class-validator';
import { VehicleSize } from '../vehicle.types';

export class CreateVehicleDto {
  @IsNotEmpty()
  plateNumber!: string;

  @IsEnum(VehicleSize)
  size!: VehicleSize;
}
