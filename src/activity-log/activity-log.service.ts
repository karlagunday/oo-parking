import { Inject, Injectable } from '@nestjs/common';
import { BaseService } from 'src/base/base.service';
import { Repository } from 'typeorm';
import { ActivityLog } from './entities/activity-log.entity';

@Injectable()
export class ActivityLogService extends BaseService<ActivityLog> {
  constructor(
    @Inject(ActivityLog.name)
    private activityLogRepository: Repository<ActivityLog>,
  ) {
    super(activityLogRepository);
  }

  getLastActivityByVehicleId(vehicleId: string) {
    return this.findOne({
      where: { vehicleId },
      order: { createdAt: 'DESC' },
    });
  }

  getLastActivityBySpaceId(spaceId: string): Promise<ActivityLog | null> {
    return this.findOne({
      where: { spaceId },
      order: { createdAt: 'DESC' },
    });
  }
}
