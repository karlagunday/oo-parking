import { forwardRef, Module } from '@nestjs/common';
import { ActivityLogModule } from 'src/activity-log/activity-log.module';
import { DatabaseModule } from 'src/database/database.module';
import { EntranceSpaceModule } from 'src/entrance-space/entrance-space.module';
import { spaceProviders } from './providers/space.providers';
import { SpaceController } from './space.controller';
import { SpaceService } from './space.service';

@Module({
  controllers: [SpaceController],
  imports: [
    DatabaseModule,
    forwardRef(() => ActivityLogModule),
    forwardRef(() => EntranceSpaceModule),
  ],
  providers: [...spaceProviders, SpaceService],
  exports: [SpaceService],
})
export class SpaceModule {}
