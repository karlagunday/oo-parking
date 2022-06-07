export enum ActivityLogType {
  In = 'IN',
  Out = 'OUT',
}

export type ActivityLogTotalHours = {
  entranceId: string;
  spaceId: string;
  hours: number;
};
