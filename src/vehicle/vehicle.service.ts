import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BaseService } from 'src/base/base.service';
import { EntranceService } from 'src/entrance/entrance.service';
import { TicketService } from 'src/ticket/ticket.service';
import { Repository } from 'typeorm';
import { Vehicle } from './entities/vehicle.entity';
import { VehicleParkingResult, VehicleUnparkingResult } from './vehicle.types';

@Injectable()
export class VehicleService extends BaseService<Vehicle> {
  constructor(
    @Inject(Vehicle.name)
    private vehicleRepository: Repository<Vehicle>,
    private entranceService: EntranceService,
    private ticketService: TicketService,
  ) {
    super(vehicleRepository);
  }

  /**
   * Parks a vehicle
   * @param {string} vehicleId id of vehicle to park
   * @param {string} entranceId id of entrance the vehicle is about to enter
   * @returns {Promise<VehicleParkingResult>} parking result
   */
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
      logs: [activityLog],
    };
  }

  /**
   * Checks if the vehicle is currently parked
   * @param {string} id id of the vehicle to check
   * @returns {Promise<boolean>} true if parked, false otherwise
   */
  async isParked(id: string): Promise<boolean> {
    return !!(await this.ticketService.getActiveTicketByVehicleId(id));
  }

  /**
   * Checks if the vehicle is unparked
   * @param {string} id id of the vehicle to check
   * @returns {Promise<boolean>} true if unparked, false otherwise
   */
  async isUnparked(id: string): Promise<boolean> {
    return !(await this.isParked(id));
  }

  /**
   * Unparks a parked vehicle
   * @param {string} vehicleId id of the vehicle to unpark
   * @returns {Promise<VehicleUnparkingResult>} unpark result
   */
  async unpark(vehicleId: string): Promise<VehicleUnparkingResult> {
    const vehicle = await this.findOneById(vehicleId);
    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    if (await this.isUnparked(vehicleId)) {
      throw new BadRequestException('Vehicle is not parked');
    }

    const { ticket, activityLogs, breakdown } = await this.entranceService.exit(
      vehicle,
    );

    return {
      vehicleId: vehicle.id,
      ticketNumber: ticket.number,
      hours: ticket.hours,
      cost: ticket.cost,
      logs: activityLogs.map(({ createdAt, entranceId, spaceId, type }) => ({
        createdAt,
        entranceId,
        spaceId,
        type,
      })),
      breakdown,
    };
  }
}
