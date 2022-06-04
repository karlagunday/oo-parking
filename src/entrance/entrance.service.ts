import { Inject, Injectable } from '@nestjs/common';
import { BaseService } from 'src/base/base.service';
import { Repository } from 'typeorm';
import { Entrance } from './entities/entrance.entity';

@Injectable()
export class EntranceService extends BaseService<Entrance> {
  constructor(
    @Inject(Entrance.name)
    private entranceRepository: Repository<Entrance>,
  ) {
    super(entranceRepository);
  }
}
