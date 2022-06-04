import { Module } from '@nestjs/common';
import { EntranceSpaceService } from './entrance-space.service';

@Module({
  providers: [EntranceSpaceService],
})
export class EntranceSpaceModule {}
