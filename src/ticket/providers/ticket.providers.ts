import { DataSource } from 'typeorm';
import { DatabaseProvider } from 'utils/constants';
import { Ticket } from '../entities/ticket.entity';

export const ticketProviders = [
  {
    provide: Ticket.name,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Ticket),
    inject: [DatabaseProvider.name],
  },
];
