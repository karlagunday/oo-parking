import source from 'ormconfig';
import { DatabaseProvider } from 'utils/constants';

export const databaseProviders = [
  {
    provide: DatabaseProvider.name,
    useFactory: async () => source.initialize(),
  },
];
