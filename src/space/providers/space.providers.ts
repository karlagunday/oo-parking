import { DataSource } from 'typeorm';
import { DatabaseProvider } from 'utils/constants';
import { Space } from '../entities/space.entity';

export const spaceProviders = [
  {
    provide: Space.name,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Space),
    inject: [DatabaseProvider.name],
  },
];
