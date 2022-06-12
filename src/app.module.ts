import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EntranceSpaceModule } from './entrance-space/entrance-space.module';
import { EntranceModule } from './entrance/entrance.module';
import { ParkingSessionModule } from './parking-session/parking-session.module';
import { SpaceModule } from './space/space.module';
import { TicketModule } from './ticket/ticket.module';
import { VehicleModule } from './vehicle/vehicle.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    VehicleModule,
    SpaceModule,
    EntranceModule,
    EntranceSpaceModule,
    TicketModule,
    ParkingSessionModule,
  ],
  providers: [],
})
export class AppModule {}
