import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { parkingSessionProviders } from './providers/parking-session.providers';
import { ParkingSessionService } from './parking-session.service';

@Module({
  imports: [DatabaseModule],
  providers: [...parkingSessionProviders, ParkingSessionService],
})
export class ParkingSessionModule {}
