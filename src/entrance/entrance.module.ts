import { Module } from '@nestjs/common';
import { EntranceService } from './entrance.service';
import { EntranceController } from './entrance.controller';
import { DatabaseModule } from 'src/database/database.module';
import { entranceProviders } from './providers/entrance.providers';

@Module({
  controllers: [EntranceController],
  imports: [DatabaseModule],
  providers: [...entranceProviders, EntranceService],
})
export class EntranceModule {}
