import { Module } from '@nestjs/common';
import { SpaceService } from './space.service';
import { SpaceController } from './space.controller';
import { DatabaseModule } from 'src/database/database.module';
import { spaceProviders } from './providers/space.providers';
import { activityLogProviders } from 'src/activity-log/providers/activity-log.providers';
import { ActivityLogService } from 'src/activity-log/activity-log.service';
import { entranceSpaceProviders } from 'src/entrance-space/providers/entrance-space.providers';
import { EntranceSpaceService } from 'src/entrance-space/entrance-space.service';

@Module({
  controllers: [SpaceController],
  imports: [DatabaseModule],
  providers: [
    ...spaceProviders,
    SpaceService,
    ...activityLogProviders,
    ActivityLogService,
    ...entranceSpaceProviders,
    EntranceSpaceService,
  ],
})
export class SpaceModule {}
