import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { compareAsc } from 'date-fns';
import { ActivityLogService } from 'src/activity-log/activity-log.service';
import {
  ActivityLogTotalHours,
  ActivityLogType,
} from 'src/activity-log/activity-log.types';
import { ActivityLog } from 'src/activity-log/entities/activity-log.entity';
import { BaseService } from 'src/base/base.service';
import { EntranceSpaceService } from 'src/entrance-space/entrance-space.service';
import { Entrance } from 'src/entrance/entities/entrance.entity';
import { Ticket } from 'src/ticket/entities/ticket.entity';
import {
  DAILY_RATE,
  FLAT_RATE,
  FLAT_RATE_HOURS,
  hourlyRate,
} from 'src/utils/constants';
import { Vehicle } from 'src/vehicle/entities/vehicle.entity';
import { VehicleSize } from 'src/vehicle/vehicle.types';
import { Repository } from 'typeorm';
import { Space } from './entities/space.entity';
import {
  SpaceCalculationResult,
  SpaceSize,
  SpaceWithDistance,
} from './space.types';

@Injectable()
export class SpaceService extends BaseService<Space> {
  constructor(
    @Inject(Space.name)
    private spaceRepository: Repository<Space>,
    private activityLogService: ActivityLogService,
    private entranceSpacesService: EntranceSpaceService,
  ) {
    super(spaceRepository);
  }

  /**
   * Retrieves all spaces assigned to the entrance of id
   * @param {string} entranceId id of entrance to retrieve the spaces for
   * @returns {Promise<SpaceWithDistance[]>} resulting space with its distance from the entrance
   */
  async findAllByEntranceId(entranceId: string): Promise<SpaceWithDistance[]> {
    return (
      await this.entranceSpacesService.findAll({
        where: { entranceId },
        relations: ['space'],
      })
    ).map(
      ({ space, distance }) =>
        ({
          /**
           * @todo remove timestamps not being intercepted by the interceptor
           */
          ...space,
          distance,
        } as SpaceWithDistance),
    );
  }

  /**
   * Checks if the vehcile size is allowed to park in a space of size
   * @param {VehicleSize} vehicleSize size of the vehicle to check
   * @param {SpaceSize} spaceSize size of the vehicle to check
   * @returns {boolean} returns true if the vehicle size can park on a space of size, false otherwise
   */
  isVehicleSizeOnSpaceSizeParkAllowed(
    vehicleSize: VehicleSize,
    spaceSize: SpaceSize,
  ) {
    return vehicleSize <= spaceSize;
  }

  /**
   * Sets the space as occupied by a vehicle
   * @param {Space} space space to occupy
   * @param {Entrance} entrance entrance where the vehicle entered
   * @param {Vehicle} vehicle vehicle to park
   * @param {Ticket} ticket ticket issued on entry of the vehicle
   * @returns {Promise<ActivityLog>} resulting IN activity log
   */
  occupy(
    space: Space,
    entrance: Entrance,
    vehicle: Vehicle,
    ticket: Ticket,
  ): Promise<ActivityLog> {
    return this.activityLogService.create(
      ActivityLog.construct({
        entranceId: entrance.id,
        spaceId: space.id,
        vehicleId: vehicle.id,
        ticketId: ticket.id,
        type: ActivityLogType.In,
      }),
    );
  }

  /**
   * Retrieves all vacant spaces of the entrance that a vehicle of size can park to
   * @param {string} entranceId entrance to check vacant spaces for
   * @param {VehicleSize} vehicleSize vehicle size to check if allowed to park in the spaces
   * @returns {Promise<SpaceWithDistance[]} resulting spaces with distances
   */
  async getAvailableEntranceSpacesForVehicleSize(
    entranceId: string,
    vehicleSize: VehicleSize,
  ): Promise<SpaceWithDistance[]> {
    const spaces = (
      await this.entranceSpacesService.findAll({
        where: { entranceId },
        relations: ['space', 'space.activityLogs'],
      })
    ).map(
      ({ space, distance }) =>
        ({
          /**
           * @todo remove timestamps not being intercepted by the interceptor
           */
          ...space,
          distance,
        } as SpaceWithDistance),
    );

    return spaces
      .filter(({ size: spaceSize }) =>
        this.isVehicleSizeOnSpaceSizeParkAllowed(vehicleSize, spaceSize),
      )
      .filter(({ activityLogs }) => {
        if (activityLogs.length === 0) {
          return true;
        }
        const lastActivty = activityLogs
          .sort((a, b) =>
            compareAsc(new Date(a.createdAt), new Date(b.createdAt)),
          )
          .pop();

        return lastActivty.type === ActivityLogType.Out;
      });
  }

  /**
   * Calculates the cost of an array of parking sessions
   * @param {ActivityLogTotalHours[]} activityHours actual hours spent per space
   * @returns {Promise<SpaceCalculationResult[]>} calculated parking cost per space
   * @todo handle FLAT_RATE addition when hours are of different spaces
   * Currently, the hours of different spaces are being calculated as if it is a separate ticket
   */
  async calculateCost(
    activityHours: ActivityLogTotalHours[],
  ): Promise<SpaceCalculationResult[]> {
    return await Promise.all(
      activityHours.map(async ({ spaceId, entranceId, hours }) => {
        const space = await this.findOneById(spaceId);

        if (!space) {
          throw new NotFoundException(`Space ${spaceId} not found`);
        }

        const roundedHours = Math.ceil(hours);
        const spaceHourlyRate = hourlyRate[space.size];
        let cost = 0;
        /**
         * Add the daily rate per 24 hours on top of the excess
         * if parking hours is at least 24 hours
         */
        if (roundedHours >= 24) {
          const days = Math.floor(roundedHours / 24);
          cost =
            days * DAILY_RATE + (roundedHours - days * 24) * spaceHourlyRate;
        } else {
          /**
           * Else, add the flat rate on top of the excess hours
           */
          const excess =
            FLAT_RATE_HOURS < roundedHours ? roundedHours - FLAT_RATE_HOURS : 0;
          cost = excess * spaceHourlyRate + FLAT_RATE;
        }

        return {
          spaceId,
          entranceId,
          hours,
          cost,
        };
      }),
    );
  }
}
