import { Module } from '@nestjs/common';
import { VehicleService } from './vehicle.service';
import { VehicleController } from './vehicle.controller';
import { DatabaseModule } from 'src/database/database.module';
import { vehicleProviders } from './providers/vehicle.providers';

@Module({
  controllers: [VehicleController],
  imports: [DatabaseModule],
  providers: [...vehicleProviders, VehicleService],
})
export class VehicleModule {}
