import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SpaceModule } from './space/space.module';
import { VehicleModule } from './vehicle/vehicle.module';
import { EntranceModule } from './entrance/entrance.module';
import { EntranceSpaceModule } from './entrance-space/entrance-space.module';
import { ActivityLogModule } from './activity-log/activity-log.module';
import { TicketModule } from './ticket/ticket.module';
import { ParkingSessionModule } from './parking-session/parking-session.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    VehicleModule,
    SpaceModule,
    EntranceModule,
    EntranceSpaceModule,
    ActivityLogModule,
    TicketModule,
    ParkingSessionModule,
  ],
  providers: [],
})
export class AppModule {}
