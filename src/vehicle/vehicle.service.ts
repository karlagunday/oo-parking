import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ActivityLogService } from 'src/activity-log/activity-log.service';
import { ActivityLogType } from 'src/activity-log/activity-log.types';
import { BaseService } from 'src/base/base.service';
import { EntranceService } from 'src/entrance/entrance.service';
import { SpaceService } from 'src/space/space.service';
import { TicketService } from 'src/ticket/ticket.service';
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
    private spaceService: SpaceService,
    private ticketService: TicketService,
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

    const { entrance, space, activityLog, ticket } =
      await this.entranceService.enter(entranceId, vehicle);

    return {
      vehicle,
      entrance,
      space,
      ticket,
      started: activityLog.createdAt,
    };
  }

  async isParked(id: string) {
    return !!(await this.ticketService.getActiveTicketByVehicleId(id));
  }

  async unpark(vehicleId: string) {
    const vehicle = await this.findOneById(vehicleId);
    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    if (await this.isUnparked(vehicleId)) {
      throw new BadRequestException('Vehicle is not parked');
    }

    // await this.spaceService.vacateByVehicle(vehicle);
  }

  async isUnparked(id: string) {
    return !(await this.isParked(id));
  }
}
