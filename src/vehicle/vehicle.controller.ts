import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { VehicleService } from './vehicle.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { BaseController } from 'src/base/base.controller';
import { Vehicle } from './entities/vehicle.entity';

@Controller('vehicles')
export class VehicleController extends BaseController<
  Vehicle,
  CreateVehicleDto,
  UpdateVehicleDto,
  VehicleService
> {
  constructor(private readonly vehicleService: VehicleService) {
    super(vehicleService);
  }
}
