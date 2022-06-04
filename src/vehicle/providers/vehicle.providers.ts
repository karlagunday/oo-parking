import { DataSource } from 'typeorm';
import { DatabaseProvider } from 'utils/constants';
import { Vehicle } from '../entities/vehicle.entity';

export const vehicleProviders = [
  {
    provide: Vehicle.name,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Vehicle),
    inject: [DatabaseProvider.name],
  },
];
