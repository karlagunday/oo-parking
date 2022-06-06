import {
  BadRequestException,
  Inject,
  Injectable,
  MethodNotAllowedException,
  NotFoundException,
} from '@nestjs/common';
import { ActivityLogService } from 'src/activity-log/activity-log.service';
import { ActivityLogType } from 'src/activity-log/activity-log.types';
import { ActivityLog } from 'src/activity-log/entities/activity-log.entity';
import { BaseService } from 'src/base/base.service';
import { EntranceService } from 'src/entrance/entrance.service';
import { Repository } from 'typeorm';
import { Vehicle } from './entities/vehicle.entity';

@Injectable()
export class VehicleService extends BaseService<Vehicle> {
  constructor(
    @Inject(Vehicle.name)
    private vehicleRepository: Repository<Vehicle>,
    private entranceService: EntranceService,
    private activityLogService: ActivityLogService,
  ) {
    super(vehicleRepository);
  }

  async park(vehicleId: string, entranceId: string) {
    const entrancesCount = await this.entranceService.count();
    if (entrancesCount < 3) {
      throw new MethodNotAllowedException('Parking unavailable');
    }

    const vehicle = await this.findOneById(vehicleId);
    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    if (await this.isParked(vehicleId)) {
      throw new BadRequestException('Vehicle is already parked');
    }

    const autoSelectedSpace =
      await this.entranceService.autoSelectAvailableSpaceByVehicleSize(
        entranceId,
        vehicle.size,
      );

    if (!autoSelectedSpace) {
      throw new MethodNotAllowedException(
        'No parking space available. Please try another entrance.',
      );
    }

    // assign vehicle to selected space
    await this.activityLogService.create(
      ActivityLog.construct({
        entranceId,
        spaceId: autoSelectedSpace.id,
        vehicleId,
        type: ActivityLogType.In,
      }),
    );

    return await this.findOneById(vehicleId);
  }

  async isParked(id: string) {
    const lastActivty =
      await this.activityLogService.getLastActivityByVehicleId(id);

    return lastActivty?.type === ActivityLogType.In;
  }
}
