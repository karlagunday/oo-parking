import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ParkingSession } from 'src/parking-session/entities/parking-session.entity';
import { ParkingSessionService } from 'src/parking-session/parking-session.service';
import { ParkingSessionStatus } from 'src/parking-session/parking-session.types';
import { VehicleSize } from 'src/vehicle/vehicle.types';
import { Space } from './entities/space.entity';
import { SpaceService } from './space.service';
import { SpaceSize } from './space.types';

describe('SpaceService', () => {
  let service: SpaceService;

  let mockedRepository: Record<string, jest.Mock>;
  let mockedParkingSessionService: Record<string, jest.Mock>;

  const mockSpace = Space.construct({
    id: 'space-id',
    size: SpaceSize.Small,
  });

  const mockParkingSession = ParkingSession.construct({
    id: 'parking-session-id',
  });

  beforeEach(async () => {
    mockedRepository = {};

    mockedParkingSessionService = {
      findOne: jest.fn(),
      start: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpaceService,
        {
          provide: Space.name,
          useValue: mockedRepository,
        },
        {
          provide: ParkingSessionService,
          useValue: mockedParkingSessionService,
        },
      ],
    }).compile();

    service = module.get<SpaceService>(SpaceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllByEntranceId', () => {
    let findAllSpy: jest.SpyInstance;

    describe('when there are no spaces assigned to the entrance', () => {
      beforeEach(() => {
        findAllSpy = jest.spyOn(service, 'findAll').mockResolvedValue([]);
      });

      it('returns an empty array', async () => {
        expect(await service.findAllByEntranceId('entrance-id')).toEqual([]);
        expect(findAllSpy).toHaveBeenCalledWith({
          relations: ['entranceSpaces'],
          where: { entranceSpaces: { entranceId: 'entrance-id' } },
        });
      });
    });

    describe('when there are assigned spaces', () => {
      beforeEach(() => {
        findAllSpy = jest
          .spyOn(service, 'findAll')
          .mockResolvedValue([mockSpace]);
      });

      it('returns the resulting spaces with distances', async () => {
        expect(await service.findAllByEntranceId('entrance-id')).toEqual([
          mockSpace,
        ]);
        expect(findAllSpy).toHaveBeenCalledWith({
          relations: ['entranceSpaces'],
          where: { entranceSpaces: { entranceId: 'entrance-id' } },
        });
      });
    });
  });

  describe('isVehicleSizeOnSpaceSizeParkAllowed', () => {
    it('returns true if vehicle size is smaller or equal to the space size', () => {
      expect(
        service.isVehicleSizeOnSpaceSizeParkAllowed(
          VehicleSize.Small,
          SpaceSize.Large,
        ),
      ).toBe(true);
      expect(
        service.isVehicleSizeOnSpaceSizeParkAllowed(
          VehicleSize.Medium,
          SpaceSize.Medium,
        ),
      ).toBe(true);
    });

    it('returns false if vehicle size is larger than the space size', () => {
      expect(
        service.isVehicleSizeOnSpaceSizeParkAllowed(
          VehicleSize.Medium,
          SpaceSize.Small,
        ),
      ).toBe(false);
      expect(
        service.isVehicleSizeOnSpaceSizeParkAllowed(
          VehicleSize.Large,
          SpaceSize.Medium,
        ),
      ).toBe(false);
    });
  });

  describe('isVacant', () => {
    describe('when there is an active parking session for the space', () => {
      beforeEach(() => {
        mockedParkingSessionService.findOne.mockResolvedValue(
          mockParkingSession,
        );
      });

      it('returns false', async () => {
        expect(await service.isVacant('space-id')).toBe(false);
        expect(mockedParkingSessionService.findOne).toHaveBeenCalledWith({
          where: { spaceId: 'space-id', status: ParkingSessionStatus.Started },
        });
      });
    });

    describe('when there is no active parking session for the space', () => {
      beforeEach(() => {
        mockedParkingSessionService.findOne.mockResolvedValue(null);
      });

      it('returns true', async () => {
        expect(await service.isVacant('space-id')).toBe(true);
        expect(mockedParkingSessionService.findOne).toHaveBeenCalledWith({
          where: { spaceId: 'space-id', status: ParkingSessionStatus.Started },
        });
      });
    });
  });

  describe('isOccupied', () => {
    let isVacantSpy: jest.SpyInstance;

    describe('when the space is vacant', () => {
      beforeEach(() => {
        isVacantSpy = jest.spyOn(service, 'isVacant').mockResolvedValue(true);
      });

      it('returns false', async () => {
        expect(await service.isOccupied('space-id')).toBe(false);
        expect(isVacantSpy).toHaveBeenCalledWith('space-id');
      });
    });

    describe('when the space is not vacant', () => {
      beforeEach(() => {
        isVacantSpy = jest.spyOn(service, 'isVacant').mockResolvedValue(false);
      });

      it('returns true', async () => {
        expect(await service.isOccupied('space-id')).toBe(true);
        expect(isVacantSpy).toHaveBeenCalledWith('space-id');
      });
    });
  });

  describe('occupy', () => {
    let isOccupiedSpy: jest.SpyInstance;

    describe('when the space is already occupied', () => {
      beforeEach(() => {
        isOccupiedSpy = jest
          .spyOn(service, 'isOccupied')
          .mockResolvedValue(true);
      });

      it('returns BadRequestException', async () => {
        await expect(
          service.occupy('ticket-id', 'entrance-id', 'space-id'),
        ).rejects.toThrow(BadRequestException);
        expect(isOccupiedSpy).toHaveBeenCalledWith('space-id');
        expect(mockedParkingSessionService.start).not.toHaveBeenCalled();
      });
    });

    describe('when the space is vacant', () => {
      beforeEach(() => {
        isOccupiedSpy = jest
          .spyOn(service, 'isOccupied')
          .mockResolvedValue(false);
        mockedParkingSessionService.start.mockReturnValue(mockParkingSession);
      });

      it('returns the created session', async () => {
        expect(
          await service.occupy('ticket-id', 'entrance-id', 'space-id'),
        ).toEqual(mockParkingSession);
        expect(isOccupiedSpy).toHaveBeenCalledWith('space-id');
        expect(mockedParkingSessionService.start).toHaveBeenCalledWith(
          'ticket-id',
          'entrance-id',
          'space-id',
        );
      });
    });
  });

  describe('getAvailableEntranceSpacesForVehicleSize', () => {
    let findAllSpy: jest.SpyInstance;

    const smallSpace = Space.construct({
      id: 'space-1',
      size: SpaceSize.Small,
      parkingSessions: [],
    });
    const mediumSpace = Space.construct({
      id: 'space-2',
      size: SpaceSize.Medium,
      parkingSessions: [
        ParkingSession.construct({
          id: 'session-1',
          status: ParkingSessionStatus.Ended,
        }),
      ],
    });
    const largeSpace = Space.construct({
      id: 'space-3',
      size: SpaceSize.Large,
      parkingSessions: [
        ParkingSession.construct({
          id: 'session-2',
          status: ParkingSessionStatus.Ended,
        }),
        ParkingSession.construct({
          id: 'session-3',
          status: ParkingSessionStatus.Started,
        }),
      ],
    });
    const spaces: Space[] = [smallSpace, mediumSpace, largeSpace];

    beforeEach(() => {
      findAllSpy = jest.spyOn(service, 'findAll').mockResolvedValue(spaces);
    });

    it('returns the available spaces', async () => {
      expect(
        await service.getAvailableEntranceSpacesForVehicleSize(
          'entrance-id',
          VehicleSize.Small,
        ),
      ).toEqual([smallSpace, mediumSpace]);
      expect(findAllSpy).toHaveBeenCalledWith({
        relations: ['parkingSessions', 'entranceSpaces'],
        where: { entranceSpaces: { entranceId: 'entrance-id' } },
      });
    });

    it('returns an empty array when no spaces are available for the vehicle size', async () => {
      expect(
        await service.getAvailableEntranceSpacesForVehicleSize(
          'entrance-id',
          VehicleSize.Large,
        ),
      ).toEqual([]);
      expect(findAllSpy).toHaveBeenCalledWith({
        relations: ['parkingSessions', 'entranceSpaces'],
        where: { entranceSpaces: { entranceId: 'entrance-id' } },
      });
    });
  });
});
