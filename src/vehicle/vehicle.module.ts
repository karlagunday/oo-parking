import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { EntranceSpaceService } from 'src/entrance-space/entrance-space.service';
import { entranceSpaceProviders } from 'src/entrance-space/providers/entrance-space.providers';
import { EntranceService } from 'src/entrance/entrance.service';
import { entranceProviders } from 'src/entrance/providers/entrance.providers';
import { ticketProviders } from 'src/ticket/providers/ticket.providers';
import { TicketService } from 'src/ticket/ticket.service';
import { vehicleProviders } from './providers/vehicle.providers';
import { VehicleController } from './vehicle.controller';
import { VehicleService } from './vehicle.service';

@Module({
  controllers: [VehicleController],
  imports: [DatabaseModule],
  providers: [
    ...vehicleProviders,
    VehicleService,
    ...entranceProviders,
    EntranceService,
    ...entranceSpaceProviders,
    EntranceSpaceService,
    ...ticketProviders,
    TicketService,
  ],
})
export class VehicleModule {}
