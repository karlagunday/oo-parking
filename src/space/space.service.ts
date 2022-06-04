import { Inject, Injectable } from '@nestjs/common';
import { BaseService } from 'src/base/base.service';
import { Repository } from 'typeorm';
import { Space } from './entities/space.entity';

@Injectable()
export class SpaceService extends BaseService<Space> {
  constructor(
    @Inject(Space.name)
    private spaceRepository: Repository<Space>,
  ) {
    super(spaceRepository);
  }
}
