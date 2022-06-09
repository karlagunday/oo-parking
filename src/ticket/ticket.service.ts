import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { differenceInMinutes } from 'date-fns';
import { ActivityLogService } from 'src/activity-log/activity-log.service';
import { ActivityLogType } from 'src/activity-log/activity-log.types';
import { ActivityLog } from 'src/activity-log/entities/activity-log.entity';
import { BaseService } from 'src/base/base.service';
import { SpaceService } from 'src/space/space.service';
import { CONTINUOUS_RATE_MINS } from 'src/utils/constants';
import { Vehicle } from 'src/vehicle/entities/vehicle.entity';
import { IsNull, Not, Repository } from 'typeorm';
import { Ticket } from './entities/ticket.entity';
import { TicketCheckoutResult, TicketStatus } from './ticket.types';

@Injectable()
export class TicketService extends BaseService<Ticket> {
  constructor(
    @Inject(Ticket.name)
    private ticketRepository: Repository<Ticket>,
    private activityLogService: ActivityLogService,
    private spaceService: SpaceService,
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
          // also clear the hours, costs
          cost: 0,
          hours: 0,
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
   * @returns {Promise<TicketCheckoutResult>} costs breakdown of the parked vehicle
   */
  async checkOutVehicle(vehicle: Vehicle): Promise<TicketCheckoutResult> {
    const ticket = await this.getActiveTicketByVehicleId(vehicle.id);

    const lastActivty =
      await this.activityLogService.getLastActivityByVehicleId(vehicle.id);

    if (lastActivty.type !== ActivityLogType.In) {
      throw new BadRequestException('Vehicle not parked');
    }

    const outActivity = await this.activityLogService.create(
      ActivityLog.construct({
        entranceId: lastActivty.entranceId,
        spaceId: lastActivty.spaceId,
        vehicleId: vehicle.id,
        ticketId: ticket.id,
        type: ActivityLogType.Out,
      }),
    );

    const parkedHours =
      await this.activityLogService.calculateParkedHoursByTicketId(ticket.id);

    const costs = await this.spaceService.calculateCost(parkedHours);

    const { totalCost, totalHours } = costs.reduce(
      (acc, curr) => ({
        totalCost: acc.totalCost + curr.cost,
        totalHours: acc.totalHours + curr.hours,
      }),
      {
        totalCost: 0,
        totalHours: 0,
      },
    );

    // also mark the ticket as completed
    await this.update(ticket.id, {
      status: TicketStatus.Completed,
      cost: totalCost,
      hours: totalHours,
      completedAt: outActivity.createdAt,
    });

    const updatedTicket = await this.findOneById(ticket.id);

    return {
      ticket: updatedTicket,
      breakdown: costs,
    };
  }
}
