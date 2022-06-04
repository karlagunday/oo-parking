import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { ActivityLogService } from './activity-log.service';
import { activityLogProviders } from './providers/activity-log.providers';

@Module({
  imports: [DatabaseModule],
  providers: [...activityLogProviders, ActivityLogService],
})
export class ActivityLogModule {}
