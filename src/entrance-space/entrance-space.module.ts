import { Module } from '@nestjs/common';
import { EntranceSpaceController } from './entrance-space.controller';

@Module({
  controllers: [EntranceSpaceController]
})
export class EntranceSpaceModule {}
