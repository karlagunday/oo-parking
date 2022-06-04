import { DataSource } from 'typeorm';
import { DatabaseProvider } from 'utils/constants';
import { Entrance } from '../entities/entrance.entity';

export const entranceProviders = [
  {
    provide: Entrance.name,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Entrance),
    inject: [DatabaseProvider.name],
  },
];
