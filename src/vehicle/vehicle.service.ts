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
import { Space } from 'src/space/entities/space.entity';
import { Repository } from 'typeorm';
import { Vehicle } from './entities/vehicle.entity';
import { VehicleParkingResult } from './vehicle.types';

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

  async park(
    vehicleId: string,
    entranceId: string,
  ): Promise<VehicleParkingResult> {
    const vehicle = await this.findOneById(vehicleId);
    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    if (await this.isParked(vehicleId)) {
      throw new BadRequestException('Vehicle is already parked');
    }

    const { entrance, space, activityLog } = await this.entranceService.enter(
      entranceId,
      vehicle,
    );

    return {
      vehicle,
      entrance,
      space,
      started: activityLog.createdAt,
    };
  }

  async isParked(id: string) {
    const lastActivty =
      await this.activityLogService.getLastActivityByVehicleId(id);

    return lastActivty?.type === ActivityLogType.In;
  }
}
