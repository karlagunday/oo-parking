import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ActivityLogModule } from './activity-log/activity-log.module';
import { EntranceSpaceModule } from './entrance-space/entrance-space.module';
import { EntranceModule } from './entrance/entrance.module';
import { PrismaModule } from './prisma/prisma.module';
import { SpaceModule } from './space/space.module';
import { VehicleModule } from './vehicle/vehicle.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SpaceModule,
    VehicleModule,
    EntranceModule,
    ActivityLogModule,
    EntranceSpaceModule,
    PrismaModule,
  ],
  providers: [],
})
export class AppModule {}
