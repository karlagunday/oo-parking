import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BaseService } from 'src/base/base.service';
import { EntranceService } from 'src/entrance/entrance.service';
import { Ticket } from 'src/ticket/entities/ticket.entity';
import { TicketService } from 'src/ticket/ticket.service';
import { Repository } from 'typeorm';
import { Vehicle } from './entities/vehicle.entity';

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
   * @returns {Promise<Ticket>} ticket for the parking
   */
  async park(vehicleId: string, entranceId: string): Promise<Ticket> {
    const vehicle = await this.findOneById(vehicleId);
    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    if (await this.isParked(vehicleId)) {
      throw new BadRequestException('Vehicle is already parked');
    }

    return await this.entranceService.enter(entranceId, vehicle);
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
   * @returns {Promise<Ticket>} updated ticket of the unparked vehicle
   */
  async unpark(vehicleId: string): Promise<Ticket> {
    const vehicle = await this.findOneById(vehicleId);
    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    if (await this.isUnparked(vehicleId)) {
      throw new BadRequestException('Vehicle is not parked');
    }

    return await this.entranceService.exit(vehicle);
  }
}
