import { DataSource } from 'typeorm';
import { DatabaseProvider } from 'utils/constants';
import { ParkingSession } from '../entities/parking-session.entity';

export const parkingSessionProviders = [
  {
    provide: ParkingSession.name,
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ParkingSession),
    inject: [DatabaseProvider.name],
  },
];
