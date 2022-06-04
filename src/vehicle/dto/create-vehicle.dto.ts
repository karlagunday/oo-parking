import { IsEnum, IsNotEmpty } from 'class-validator';
import { VehicleService } from '../vehicle.service';
import { VehicleSize } from '../vehicle.types';

export class CreateVehicleDto {
  @IsNotEmpty()
  plateNumber!: string;

  @IsEnum(VehicleService)
  vehicleSize!: VehicleSize;
}
