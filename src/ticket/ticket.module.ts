import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { ticketProviders } from './providers/ticket.providers';
import { TicketService } from './ticket.service';

@Module({
  imports: [DatabaseModule],
  providers: [...ticketProviders, TicketService],
})
export class TicketModule {}
