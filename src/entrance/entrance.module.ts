import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { EntranceSpaceService } from 'src/entrance-space/entrance-space.service';
import { entranceSpaceProviders } from 'src/entrance-space/providers/entrance-space.providers';
import { spaceProviders } from 'src/space/providers/space.providers';
import { SpaceService } from 'src/space/space.service';
import { EntranceController } from './entrance.controller';
import { EntranceService } from './entrance.service';
import { entranceProviders } from './providers/entrance.providers';

@Module({
  controllers: [EntranceController],
  imports: [DatabaseModule],
  providers: [
    ...entranceProviders,
    EntranceService,
    ...spaceProviders,
    SpaceService,
    ...entranceSpaceProviders,
    EntranceSpaceService,
  ],
})
export class EntranceModule {}
