import { forwardRef, Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { EntranceSpaceModule } from 'src/entrance-space/entrance-space.module';
import { EntranceModule } from 'src/entrance/entrance.module';
import { TicketModule } from 'src/ticket/ticket.module';
import { vehicleProviders } from './providers/vehicle.providers';
import { VehicleController } from './vehicle.controller';
import { VehicleService } from './vehicle.service';

@Module({
  controllers: [VehicleController],
  imports: [
    DatabaseModule,
    forwardRef(() => EntranceModule),
    forwardRef(() => EntranceSpaceModule),
    forwardRef(() => TicketModule),
  ],
  providers: [...vehicleProviders, VehicleService],
  exports: [VehicleService],
})
export class VehicleModule {}
