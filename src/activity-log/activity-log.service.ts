import { Inject, Injectable } from '@nestjs/common';
import { differenceInSeconds } from 'date-fns';
import { BaseService } from 'src/base/base.service';
import { FindOneOptions, Repository } from 'typeorm';
import { ActivityLogTotalHours, ActivityLogType } from './activity-log.types';
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

  getAllByTicketId(ticketId: string) {
    return this.findAll({
      where: { ticketId },
      order: { createdAt: 'DESC' },
    });
  }

  getFirstActivityByTicketId(
    ticketId: string,
    { where, order, ...options }: FindOneOptions<ActivityLog> = {},
  ): Promise<ActivityLog | null> {
    return this.findOne({
      where: { ticketId, ...where },
      order: { createdAt: 'ASC', ...order },
      ...options,
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

  /**
   * @todo handle activities of different space types?
   */
  async calculateParkedHoursByTicketId(
    ticketId: string,
  ): Promise<ActivityLogTotalHours[]> {
    const inActivity = await this.getFirstActivityByTicketId(ticketId, {
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
     * Assuming all activities of a ticket are in the same entrance, space
     */
    return [
      {
        entranceId: outActivity.entranceId,
        spaceId: outActivity.spaceId,

        /**
         * Manually convert to hours to be precise
         */
        hours: durationInSeconds / 60 / 60,
      },
    ];
  }
}
