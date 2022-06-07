import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
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
import { TicketStatus } from './ticket.types';

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

      console.log({
        now,
        completedAt: lastTicket.completedAt,
        ticketNumber: lastTicket.number,
        minutesFromLastCheckout,
      });

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

  async checkOutVehicle(vehicle: Vehicle) {
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