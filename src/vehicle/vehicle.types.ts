import { ActivityLogType } from 'src/activity-log/activity-log.types';
import { ActivityLog } from 'src/activity-log/entities/activity-log.entity';
import { Entrance } from 'src/entrance/entities/entrance.entity';
import { Space } from 'src/space/entities/space.entity';
import { Ticket } from 'src/ticket/entities/ticket.entity';
import { TicketBreakdown } from 'src/ticket/ticket.types';
import { Vehicle } from './entities/vehicle.entity';

export enum VehicleSize {
  Small = 1,
  Medium = 10,
  Large = 20,
}

export type VehicleParkingResult = {
  vehicle: Vehicle;
  entrance: Entrance;
  space: Space;
  ticket: Ticket;
  logs: Partial<ActivityLog>[];
};

export type VehicleUnparkingResult = {
  vehicleId: string;
  ticketNumber: number;
  hours: number;
  cost: number;
  logs: {
    createdAt: Date;
    entranceId: string;
    spaceId: string;
    type: ActivityLogType;
  }[];
  breakdown: TicketBreakdown[];
};
