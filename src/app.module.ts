import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { VehicleModule } from './vehicle/vehicle.module';
import { VehicleService } from './vehicle/vehicle.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), VehicleModule],
  providers: [],
})
export class AppModule {}
