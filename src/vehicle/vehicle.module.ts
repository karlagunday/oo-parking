import { Module } from '@nestjs/common';
import { VehicleService } from './vehicle.service';
import { VehicleController } from './vehicle.controller';
import { DatabaseModule } from 'src/database/database.module';
import { vehicleProviders } from './providers/vehicle.providers';
import { activityLogProviders } from 'src/activity-log/providers/activity-log.providers';
import { ActivityLogService } from 'src/activity-log/activity-log.service';
import { entranceProviders } from 'src/entrance/providers/entrance.providers';
import { EntranceService } from 'src/entrance/entrance.service';
import { spaceProviders } from 'src/space/providers/space.providers';
import { SpaceService } from 'src/space/space.service';
import { entranceSpaceProviders } from 'src/entrance-space/providers/entrance-space.providers';
import { EntranceSpaceService } from 'src/entrance-space/entrance-space.service';

@Module({
  controllers: [VehicleController],
  imports: [DatabaseModule],
  providers: [
    ...vehicleProviders,
    VehicleService,
    ...entranceProviders,
    EntranceService,
    ...activityLogProviders,
    ActivityLogService,
    ...spaceProviders,
    SpaceService,
    ...entranceSpaceProviders,
    EntranceSpaceService,
  ],
})
export class VehicleModule {}
