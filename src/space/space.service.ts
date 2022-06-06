import { Inject, Injectable } from '@nestjs/common';
import { ActivityLogService } from 'src/activity-log/activity-log.service';
import { ActivityLogType } from 'src/activity-log/activity-log.types';
import { ActivityLog } from 'src/activity-log/entities/activity-log.entity';
import { BaseService } from 'src/base/base.service';
import { EntranceSpaceService } from 'src/entrance-space/entrance-space.service';
import { Entrance } from 'src/entrance/entities/entrance.entity';
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
  ): Promise<ActivityLog> {
    // assign vehicle to a space
    return this.activityLogService.create(
      ActivityLog.construct({
        entranceId: entrance.id,
        spaceId: space.id,
        vehicleId: vehicle.id,
        type: ActivityLogType.In,
      }),
    );
  }

  async isVacant(id: string) {
    const lastActivity = await this.activityLogService.getLastActivityBySpaceId(
      id,
    );

    return !lastActivity || lastActivity.type === ActivityLogType.Out;
  }
}
