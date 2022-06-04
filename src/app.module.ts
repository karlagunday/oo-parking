import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SpaceModule } from './space/space.module';
import { VehicleModule } from './vehicle/vehicle.module';
import { EntranceModule } from './entrance/entrance.module';
import { EntranceSpaceModule } from './entrance-space/entrance-space.module';
import { ActivityLogModule } from './activity-log/activity-log.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    VehicleModule,
    SpaceModule,
    EntranceModule,
    EntranceSpaceModule,
    ActivityLogModule,
  ],
  providers: [],
})
export class AppModule {}
