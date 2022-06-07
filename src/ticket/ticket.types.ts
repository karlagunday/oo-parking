export enum TicketStatus {
  Active = 'active',
  /**
   * @todo update to be all lowercase
   */
  Completed = 'Completed',
}

export type TicketBreakdown = {
  spaceId: string;
  entranceId: string;
  hours: number;
  cost: number;
};
