import { VehicleSize } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateVehicleDto {
  @IsNotEmpty()
  plateNumber!: string;

  @IsEnum(VehicleSize)
  size!: VehicleSize;
}

export class UpdateVehicleDto {
  @IsOptional()
  @IsNotEmpty()
  plateNumber?: string;

  @IsOptional()
  @IsEnum(VehicleSize)
  size?: VehicleSize;
}
