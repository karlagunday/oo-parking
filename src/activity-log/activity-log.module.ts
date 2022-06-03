import { Module } from '@nestjs/common';
import { ActivityLogService } from './activity-log.service';
import { ActivityLogController } from './activity-log.controller';

@Module({
  providers: [ActivityLogService],
  controllers: [ActivityLogController]
})
export class ActivityLogModule {}
