import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { VehicleService } from '../vehicle.service';
import { VehicleSize } from '../vehicle.types';
import { CreateVehicleDto } from './create-vehicle.dto';

export class UpdateVehicleDto extends PartialType(CreateVehicleDto) {
  @IsOptional()
  @IsNotEmpty()
  plateNumber?: string;

  @IsEnum(VehicleService)
  vehicleSize?: VehicleSize;
}
