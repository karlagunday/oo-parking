import { Test, TestingModule } from '@nestjs/testing';
import { ParkingSession } from './entities/parking-session.entity';
import { ParkingSessionService } from './parking-session.service';

describe('ParkingSessionService', () => {
  let service: ParkingSessionService;

  let mockedRepository: Record<string, jest.Mock>;

  beforeEach(async () => {
    mockedRepository = {};

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ParkingSessionService,
        {
          provide: ParkingSession.name,
          useValue: mockedRepository,
        },
      ],
    }).compile();

    service = module.get<ParkingSessionService>(ParkingSessionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
