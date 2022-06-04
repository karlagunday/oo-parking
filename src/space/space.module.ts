import { Module } from '@nestjs/common';
import { SpaceService } from './space.service';
import { SpaceController } from './space.controller';
import { DatabaseModule } from 'src/database/database.module';
import { spaceProviders } from './providers/space.providers';

@Module({
  controllers: [SpaceController],
  imports: [DatabaseModule],
  providers: [...spaceProviders, SpaceService],
})
export class SpaceModule {}
