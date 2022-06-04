import { DataSource } from 'typeorm';
import { DatabaseProvider } from 'utils/constants';
import { ActivityLog } from '../entities/activity-log.entity';

export const activityLogProviders = [
  {
    provide: ActivityLog.name,
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ActivityLog),
    inject: [DatabaseProvider.name],
  },
];
