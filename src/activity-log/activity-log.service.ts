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

  /**
   * Gets the last activity of the specified ID
   * @param {string} vehicleId Id of the vehicle
   * @param {FindOneOptions<ActivityLog>} [options] find one options
   * @returns {Promise<ActivityLog | null>} resulting activity log
   */
  getLastActivityByVehicleId(
    vehicleId: string,
    { where, order, ...options }: FindOneOptions<ActivityLog> = {},
  ): Promise<ActivityLog | null> {
    return this.findOne({
      where: { vehicleId, ...where },
      order: { createdAt: 'DESC', ...order },
      ...options,
    });
  }

  /**
   * Gets the last activity of the specified space ID
   * @param {string} spaceId id of the space
   * @returns {Proimise<ActivityLog | null>} resulting activity log
   */
  getLastActivityBySpaceId(spaceId: string): Promise<ActivityLog | null> {
    return this.findOne({
      where: { spaceId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get all activities of specified ticket ID
   * @param {string} ticketId id of the ticket
   * @returns {Promise<AcitivtyLog[]>} resulting activity logs
   */
  getAllByTicketId(ticketId: string): Promise<ActivityLog[]> {
    return this.findAll({
      where: { ticketId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get the first activity of the specified ticket id
   * @param {string} ticketId  id of the ticket
   * @param {FindOneOptions<ActivityLog>} [options] find one options
   * @returns {Promise<ActivityLog | null>} resulting activity log
   */
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

  /**
   * Get the last activity of the specified ticket Id
   * @param {string} ticketId id of the ticket
   * @param {FindOneOptions<ActivityLog>} [options] find one options
   * @returns {Promise<ActivityLog | null>} resulting activity log
   */
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
   * Calculate the parked hours by the specified ticket id.
   * This groups the total hours by space id
   * @param {string} ticketId id of the ticket
   * @returns {Promise<ActivityLogTotalHours[]>} Total hours by the ticket per space
   * @todo Currently assuming that all activity logs per ticket are all for the same space
   * Update to support handling activity logs of different spaces
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
