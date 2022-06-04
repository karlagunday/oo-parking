import { Controller } from '@nestjs/common';
import { BaseController } from 'src/base/base.controller';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { Vehicle } from './entities/vehicle.entity';
import { VehicleService } from './vehicle.service';

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
