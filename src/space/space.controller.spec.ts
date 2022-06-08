import { Test, TestingModule } from '@nestjs/testing';
import { SpaceController } from './space.controller';
import { SpaceService } from './space.service';

describe('SpaceController', () => {
  let controller: SpaceController;
  let mockedService: Record<string, jest.Mock>;

  beforeEach(async () => {
    mockedService = {};

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpaceController,
        {
          provide: SpaceService,
          useValue: mockedService,
        },
      ],
    }).compile();

    controller = module.get<SpaceController>(SpaceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
