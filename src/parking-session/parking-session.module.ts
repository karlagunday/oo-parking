import { forwardRef, Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { EntranceModule } from 'src/entrance/entrance.module';
import { SpaceModule } from 'src/space/space.module';
import { ParkingSessionService } from './parking-session.service';
import { parkingSessionProviders } from './providers/parking-session.providers';

@Module({
  imports: [
    DatabaseModule,
    forwardRef(() => EntranceModule),
    forwardRef(() => SpaceModule),
  ],
  providers: [...parkingSessionProviders, ParkingSessionService],
  exports: [ParkingSessionService],
})
export class ParkingSessionModule {}
