import { forwardRef, Module } from '@nestjs/common';
import { ActivityLogModule } from 'src/activity-log/activity-log.module';
import { DatabaseModule } from 'src/database/database.module';
import { EntranceSpaceModule } from 'src/entrance-space/entrance-space.module';
import { EntranceModule } from 'src/entrance/entrance.module';
import { ParkingSessionModule } from 'src/parking-session/parking-session.module';
import { spaceProviders } from './providers/space.providers';
import { SpaceController } from './space.controller';
import { SpaceService } from './space.service';

@Module({
  controllers: [SpaceController],
  imports: [
    DatabaseModule,
    forwardRef(() => ActivityLogModule),
    forwardRef(() => EntranceSpaceModule),
    forwardRef(() => ParkingSessionModule),
    forwardRef(() => EntranceModule),
  ],
  providers: [...spaceProviders, SpaceService],
  exports: [SpaceService],
})
export class SpaceModule {}
