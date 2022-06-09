import { Test, TestingModule } from '@nestjs/testing';
import { VehicleController } from './vehicle.controller';
import { VehicleService } from './vehicle.service';

describe('VehicleController', () => {
  let controller: VehicleController;
  let mockedService: Record<string, jest.Mock>;

  const parkResult = Symbol('parkResult');
  const unparkResult = Symbol('unparkResult');

  beforeEach(async () => {
    mockedService = {
      park: jest.fn().mockResolvedValue(parkResult),
      unpark: jest.fn().mockResolvedValue(unparkResult),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehicleController,
        {
          provide: VehicleService,
          useValue: mockedService,
        },
      ],
    }).compile();

    controller = module.get<VehicleController>(VehicleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('park', () => {
    it('calls the park service method', async () => {
      expect(
        await controller.park('vehicle-id', { entranceId: 'entrance-id' }),
      ).toEqual(parkResult);
      expect(mockedService.park).toHaveBeenCalledWith(
        'vehicle-id',
        'entrance-id',
      );
    });
  });

  describe('unpark', () => {
    it('calls the unpark service method', async () => {
      expect(await controller.unpark('vehicle-id')).toEqual(unparkResult);
      expect(mockedService.unpark).toHaveBeenCalledWith('vehicle-id');
    });
  });
});
