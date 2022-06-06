import { Entrance } from 'src/entrance/entities/entrance.entity';
import { Space } from 'src/space/entities/space.entity';
import { Ticket } from 'src/ticket/entities/ticket.entity';
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
  started: Date;
};
