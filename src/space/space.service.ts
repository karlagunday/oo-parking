import { Inject, Injectable } from '@nestjs/common';
import { compareDesc } from 'date-fns';
import { ActivityLogService } from 'src/activity-log/activity-log.service';
import { ActivityLogType } from 'src/activity-log/activity-log.types';
import { ActivityLog } from 'src/activity-log/entities/activity-log.entity';
import { BaseService } from 'src/base/base.service';
import { EntranceSpaceService } from 'src/entrance-space/entrance-space.service';
import { Entrance } from 'src/entrance/entities/entrance.entity';
import { Ticket } from 'src/ticket/entities/ticket.entity';
import { Vehicle } from 'src/vehicle/entities/vehicle.entity';
import { VehicleSize } from 'src/vehicle/vehicle.types';
import { Repository } from 'typeorm';
import { Space } from './entities/space.entity';
import { SpaceSize, SpaceWithDistance } from './space.types';

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

  isVehicleSizeOnSpaceSizeParkAllowed(
    vehicleSize: VehicleSize,
    spaceSize: SpaceSize,
  ) {
    return vehicleSize <= spaceSize;
  }

  occupy(
    space: Space,
    entrance: Entrance,
    vehicle: Vehicle,
    ticket: Ticket,
  ): Promise<ActivityLog> {
    // assign vehicle to a space
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
   * @todo simplify by doing JOINs
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
            compareDesc(new Date(a.createdAt), new Date(b.createdAt)),
          )
          .pop();

        return lastActivty.type === ActivityLogType.Out;
      });
  }
}
