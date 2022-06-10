import { forwardRef, Module } from '@nestjs/common';
import { ActivityLogModule } from 'src/activity-log/activity-log.module';
import { DatabaseModule } from 'src/database/database.module';
import { EntranceSpaceModule } from 'src/entrance-space/entrance-space.module';
import { SpaceModule } from 'src/space/space.module';
import { TicketModule } from 'src/ticket/ticket.module';
import { EntranceController } from './entrance.controller';
import { EntranceService } from './entrance.service';
import { entranceProviders } from './providers/entrance.providers';

@Module({
  controllers: [EntranceController],
  imports: [
    DatabaseModule,
    forwardRef(() => SpaceModule),
    forwardRef(() => EntranceSpaceModule),
    forwardRef(() => ActivityLogModule),
    forwardRef(() => TicketModule),
  ],
  providers: [...entranceProviders, EntranceService],
  exports: [EntranceService],
})
export class EntranceModule {}
