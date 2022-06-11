import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { differenceInMinutes } from 'date-fns';
import { ActivityLogService } from 'src/activity-log/activity-log.service';
import { BaseService } from 'src/base/base.service';
import { ParkingSessionService } from 'src/parking-session/parking-session.service';
import { SpaceService } from 'src/space/space.service';
import { CONTINUOUS_RATE_MINS } from 'src/utils/constants';
import { Vehicle } from 'src/vehicle/entities/vehicle.entity';
import { IsNull, Not, Repository } from 'typeorm';
import { Ticket } from './entities/ticket.entity';
import { TicketStatus } from './ticket.types';

@Injectable()
export class TicketService extends BaseService<Ticket> {
  constructor(
    @Inject(Ticket.name)
    private ticketRepository: Repository<Ticket>,
    private activityLogService: ActivityLogService,
    @Inject(forwardRef(() => SpaceService))
    private spaceService: SpaceService,
    @Inject(forwardRef(() => ParkingSessionService))
    private parkingSessionService: ParkingSessionService,
  ) {
    super(ticketRepository);
  }

  /**
   * Retrieves the current active ticket for a vehicle
   * @param {string} vehicleId id of the vehicle to retrieve the ticket for
   * @returns {Promise<Ticket>} resulting ticket
   */
  getActiveTicketByVehicleId(vehicleId: string) {
    return this.findOne({
      where: {
        vehicleId,
        status: TicketStatus.Active,
      },
      order: {
        /**
         * There should only be 1 active ticket per vehicle
         * but get the most recent one just to be sure
         */
        createdAt: 'DESC',
      },
    });
  }

  /**
   * Issues a new ticket, or reissues an existing one for the vehicle
   * @param {Vehicle} vehicle vehicle to issue a ticket for
   * @returns {Promise<Ticket>} issued ticket
   */
  async getTicketForVehicle(vehicle: Vehicle) {
    const lastTicket = await this.findOne({
      where: {
        vehicleId: vehicle.id,
        status: TicketStatus.Completed,
        completedAt: Not(IsNull()),
      },
      order: { completedAt: 'DESC' },
    });

    if (!!lastTicket) {
      const now = new Date();
      const minutesFromLastCheckout = differenceInMinutes(
        now,
        new Date(lastTicket.completedAt),
      );

      // reuse last ticket if checking in within the countinuous rate mins after last checkout
      if (minutesFromLastCheckout <= CONTINUOUS_RATE_MINS) {
        await this.update(lastTicket.id, {
          status: TicketStatus.Active,
          completedAt: null,
        });
        return await this.findOneById(lastTicket.id);
      }
    }

    // else, issue a new ticket
    return this.create(
      Ticket.construct({
        vehicleId: vehicle.id,
        status: TicketStatus.Active,
      }),
    );
  }

  /**
   * Checks out a vehicle from its currently parked space
   * @param {Vehicle} vehicle vehicle to check out
   * @returns {Promise<Ticket>} costs breakdown of the parked vehicle
   */
  async checkOutVehicle(vehicle: Vehicle): Promise<Ticket> {
    const ticket = await this.getActiveTicketByVehicleId(vehicle.id);

    if (!ticket) {
      throw new BadRequestException(
        `No active ticket found for vehicle ${vehicle.id}`,
      );
    }

    const endedSession = await this.parkingSessionService.stop(ticket);

    // update the ticket to reflect the recently-stopped parking session
    const updatedTotalCost = ticket.totalCost + endedSession.cost;
    const updatedActualHours = ticket.actualHours + endedSession.paidHours;
    const updatedPaidHours =
      ticket.paidHours + Math.ceil(endedSession.paidHours);
    const updatedRemainingHours = updatedPaidHours - updatedActualHours;

    await this.update(ticket.id, {
      totalCost: updatedTotalCost,
      actualHours: updatedActualHours,
      paidHours: updatedPaidHours,
      remainingHours: updatedRemainingHours,
    });

    return await this.findOneById(ticket.id);
  }
}
