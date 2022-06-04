import { Inject, Injectable } from '@nestjs/common';
import { BaseService } from 'src/base/base.service';
import { Repository } from 'typeorm';
import { Vehicle } from './entities/vehicle.entity';

@Injectable()
export class VehicleService extends BaseService<Vehicle> {
  constructor(
    @Inject(Vehicle.name)
    private vehicleRepository: Repository<Vehicle>,
  ) {
    super(vehicleRepository);
  }
}
