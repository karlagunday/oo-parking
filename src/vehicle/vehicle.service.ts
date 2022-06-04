import { Inject, Injectable } from '@nestjs/common';
import { BaseService } from 'src/base/base.service';
import { Repository } from 'typeorm';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { Vehicle } from './entities/vehicle.entity';

@Injectable()
export class VehicleService extends BaseService<
  Vehicle,
  CreateVehicleDto,
  UpdateVehicleDto
> {
  constructor(
    @Inject(Vehicle.name)
    private vehicleRepository: Repository<Vehicle>,
  ) {
    super(vehicleRepository);
  }
}
