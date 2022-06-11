import { forwardRef, Module } from '@nestjs/common';
import { ActivityLogModule } from 'src/activity-log/activity-log.module';
import { DatabaseModule } from 'src/database/database.module';
import { EntranceSpaceModule } from 'src/entrance-space/entrance-space.module';
import { ParkingSessionModule } from 'src/parking-session/parking-session.module';
import { SpaceModule } from 'src/space/space.module';
import { ticketProviders } from './providers/ticket.providers';
import { TicketService } from './ticket.service';

@Module({
  imports: [
    DatabaseModule,
    forwardRef(() => ActivityLogModule),
    forwardRef(() => SpaceModule),
    forwardRef(() => EntranceSpaceModule),
    forwardRef(() => ParkingSessionModule),
  ],
  providers: [...ticketProviders, TicketService],
  exports: [TicketService],
})
export class TicketModule {}
