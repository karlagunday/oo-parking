import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { EntranceSpaceService } from './entrance-space.service';
import { entranceSpaceProviders } from './providers/entrance-space.providers';

@Module({
  imports: [DatabaseModule],
  providers: [...entranceSpaceProviders, EntranceSpaceService],
  exports: [EntranceSpaceService],
})
export class EntranceSpaceModule {}
