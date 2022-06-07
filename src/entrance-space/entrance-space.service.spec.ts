import { Test, TestingModule } from '@nestjs/testing';
import { EntranceSpace } from './entities/entrance-space.entity';
import { EntranceSpaceService } from './entrance-space.service';

describe('EntranceSpaceService', () => {
  let service: EntranceSpaceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EntranceSpaceService,
        {
          provide: EntranceSpace.name,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<EntranceSpaceService>(EntranceSpaceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
