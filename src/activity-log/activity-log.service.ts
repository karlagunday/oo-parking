import { Inject, Injectable } from '@nestjs/common';
import { differenceInSeconds } from 'date-fns';
import { BaseService } from 'src/base/base.service';
import { FindOneOptions, Repository } from 'typeorm';
import { ActivityLogType } from './activity-log.types';
import { ActivityLog } from './entities/activity-log.entity';

@Injectable()
export class ActivityLogService extends BaseService<ActivityLog> {
  constructor(
    @Inject(ActivityLog.name)
    private activityLogRepository: Repository<ActivityLog>,
  ) {
    super(activityLogRepository);
  }

  getLastActivityByVehicleId(
    vehicleId: string,
    { where, order, ...options }: FindOneOptions<ActivityLog> = {},
  ) {
    return this.findOne({
      where: { vehicleId, ...where },
      order: { createdAt: 'DESC', ...order },
      ...options,
    });
  }

  getLastActivityBySpaceId(spaceId: string): Promise<ActivityLog | null> {
    return this.findOne({
      where: { spaceId },
      order: { createdAt: 'DESC' },
    });
  }

  getLastActivityByTicketId(
    ticketId: string,
    { where, order, ...options }: FindOneOptions<ActivityLog> = {},
  ): Promise<ActivityLog | null> {
    return this.findOne({
      where: { ticketId, ...where },
      order: { createdAt: 'DESC', ...order },
      ...options,
    });
  }

  async calculateParkedHoursByTicketId(ticketId: string) {
    const inActivity = await this.getLastActivityByTicketId(ticketId, {
      where: { type: ActivityLogType.In },
    });

    const outActivity = await this.getLastActivityByTicketId(ticketId, {
      where: { type: ActivityLogType.Out },
    });

    const durationInSeconds = differenceInSeconds(
      new Date(outActivity.createdAt),
      new Date(inActivity.createdAt),
    );

    /**
     * Manually convert to hours to be precise
     */
    return durationInSeconds / 60 / 60;
  }
}
