import { Inject, Injectable } from '@nestjs/common';
import { BaseService } from 'src/base/base.service';
import { Repository } from 'typeorm';
import { ParkingSession } from './entities/parking-session.entity';

@Injectable()
export class ParkingSessionService extends BaseService<ParkingSession> {
  constructor(
    @Inject(ParkingSession.name)
    private sessionRepository: Repository<ParkingSession>,
  ) {
    super(sessionRepository);
  }
}
