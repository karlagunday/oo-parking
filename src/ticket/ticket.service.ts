import { Inject, Injectable } from '@nestjs/common';
import { BaseService } from 'src/base/base.service';
import { Vehicle } from 'src/vehicle/entities/vehicle.entity';
import { Repository } from 'typeorm';
import { Ticket } from './entities/ticket.entity';
import { TicketStatus } from './ticket.types';

@Injectable()
export class TicketService extends BaseService<Ticket> {
  constructor(
    @Inject(Ticket.name)
    private ticketRepository: Repository<Ticket>,
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

  getTicketForVehicle(vehicle: Vehicle) {
    /**
     * @todo determine if a ticket can be reused
     * for a 'continuous' parking
     */
    return this.create(
      Ticket.construct({
        vehicleId: vehicle.id,
        status: TicketStatus.Active,
      }),
    );
  }
}
