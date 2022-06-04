import { DataSource } from 'typeorm';
import { DatabaseProvider } from 'utils/constants';
import { EntranceSpace } from '../entities/entrance-space.entity';

export const entranceSpaceProviders = [
  {
    provide: EntranceSpace.name,
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(EntranceSpace),
    inject: [DatabaseProvider.name],
  },
];
