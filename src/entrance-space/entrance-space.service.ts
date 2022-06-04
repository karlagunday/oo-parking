import { Inject, Injectable } from '@nestjs/common';
import { BaseService } from 'src/base/base.service';
import { Repository } from 'typeorm';
import { EntranceSpace } from './entities/entrance-space.entity';

@Injectable()
export class EntranceSpaceService extends BaseService<EntranceSpace> {
  constructor(
    @Inject(EntranceSpace.name)
    private entranceSpaceRepository: Repository<EntranceSpace>,
  ) {
    super(entranceSpaceRepository);
  }
}
