import { Test, TestingModule } from '@nestjs/testing';
import { EntranceController } from './entrance.controller';
import { EntranceService } from './entrance.service';

describe('EntranceController', () => {
  let controller: EntranceController;
  let mockedService: Record<string, jest.Mock>;

  const mockEntranceSpace = Symbol(`mockEntranceSpace`);

  beforeEach(async () => {
    mockedService = {
      assignSpaceById: jest.fn().mockResolvedValue(mockEntranceSpace),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EntranceController,
        {
          provide: EntranceService,
          useValue: mockedService,
        },
      ],
    }).compile();

    controller = module.get<EntranceController>(EntranceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('assignSpace', () => {
    it('returns the resulting entrance space assignment', async () => {
      expect(
        await controller.assignSpace('entrance-id', {
          spaceId: 'space-id',
          distance: 10,
        }),
      ).toEqual(mockEntranceSpace);
      expect(mockedService.assignSpaceById).toHaveBeenCalledWith(
        'entrance-id',
        {
          spaceId: 'space-id',
          distance: 10,
        },
      );
    });
  });
});
