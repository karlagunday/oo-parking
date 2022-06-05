import { Body, Controller, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { BaseControllerFactory } from 'src/base/base-controller.factory';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { ParkVehicleDto } from './dto/park-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { Vehicle } from './entities/vehicle.entity';
import { VehicleService } from './vehicle.service';

@Controller('vehicles')
export class VehicleController extends BaseControllerFactory<
  Vehicle,
  CreateVehicleDto,
  UpdateVehicleDto
>(CreateVehicleDto, UpdateVehicleDto) {
  constructor(private readonly vehicleService: VehicleService) {
    super(vehicleService);
  }

  @Post(':id/park')
  park(@Param('id', ParseUUIDPipe) id: string, @Body() dto: ParkVehicleDto) {
    return this.vehicleService.park(id, dto.entranceId);
  }
}
