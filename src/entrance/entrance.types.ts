import { ActivityLog } from 'src/activity-log/entities/activity-log.entity';
import { Space } from 'src/space/entities/space.entity';
import { Ticket } from 'src/ticket/entities/ticket.entity';
import { TicketBreakdown } from 'src/ticket/ticket.types';
import { Entrance } from './entities/entrance.entity';

export type EntranceEntryResult = {
  entrance: Entrance;
  activityLog: ActivityLog;
  space: Space;
  ticket: Ticket;
};

export type EntranceExitResult = {
  ticket: Ticket;
  breakdown: TicketBreakdown[];
  activityLogs: ActivityLog[];
};
