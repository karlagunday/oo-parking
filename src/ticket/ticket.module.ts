import { Module } from '@nestjs/common';
import { ActivityLogService } from 'src/activity-log/activity-log.service';
import { activityLogProviders } from 'src/activity-log/providers/activity-log.providers';
import { DatabaseModule } from 'src/database/database.module';
import { EntranceSpaceService } from 'src/entrance-space/entrance-space.service';
import { entranceSpaceProviders } from 'src/entrance-space/providers/entrance-space.providers';
import { spaceProviders } from 'src/space/providers/space.providers';
import { SpaceService } from 'src/space/space.service';
import { ticketProviders } from './providers/ticket.providers';
import { TicketService } from './ticket.service';

@Module({
  imports: [DatabaseModule],
  providers: [
    ...ticketProviders,
    TicketService,
    ...activityLogProviders,
    ActivityLogService,
    ...spaceProviders,
    SpaceService,
    ...entranceSpaceProviders,
    EntranceSpaceService,
  ],
})
export class TicketModule {}
