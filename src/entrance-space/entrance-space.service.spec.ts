import { Test, TestingModule } from '@nestjs/testing';
import { EntranceSpaceService } from './entrance-space.service';

describe('EntranceSpaceService', () => {
  let service: EntranceSpaceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EntranceSpaceService],
    }).compile();

    service = module.get<EntranceSpaceService>(EntranceSpaceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
