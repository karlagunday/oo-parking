import { Module } from '@nestjs/common';
import { ActivityLogService } from 'src/activity-log/activity-log.service';
import { activityLogProviders } from 'src/activity-log/providers/activity-log.providers';
import { DatabaseModule } from 'src/database/database.module';
import { EntranceSpaceService } from 'src/entrance-space/entrance-space.service';
import { entranceSpaceProviders } from 'src/entrance-space/providers/entrance-space.providers';
import { spaceProviders } from 'src/space/providers/space.providers';
import { SpaceService } from 'src/space/space.service';
import { ticketProviders } from 'src/ticket/providers/ticket.providers';
import { TicketService } from 'src/ticket/ticket.service';
import { EntranceController } from './entrance.controller';
import { EntranceService } from './entrance.service';
import { entranceProviders } from './providers/entrance.providers';

@Module({
  controllers: [EntranceController],
  imports: [DatabaseModule],
  providers: [
    ...entranceProviders,
    EntranceService,
    ...spaceProviders,
    SpaceService,
    ...entranceSpaceProviders,
    EntranceSpaceService,
    ...activityLogProviders,
    ActivityLogService,
    ...ticketProviders,
    TicketService,
  ],
})
export class EntranceModule {}
