import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { addHours, subHours } from 'date-fns';
import { ActivityLogService } from 'src/activity-log/activity-log.service';
import { ActivityLogType } from 'src/activity-log/activity-log.types';
import { ActivityLog } from 'src/activity-log/entities/activity-log.entity';
import { EntranceSpace } from 'src/entrance-space/entities/entrance-space.entity';
import { EntranceSpaceService } from 'src/entrance-space/entrance-space.service';
import { Entrance } from 'src/entrance/entities/entrance.entity';
import { ParkingSession } from 'src/parking-session/entities/parking-session.entity';
import { ParkingSessionService } from 'src/parking-session/parking-session.service';
import { ParkingSessionStatus } from 'src/parking-session/parking-session.types';
import { Ticket } from 'src/ticket/entities/ticket.entity';
import { DAILY_RATE, FLAT_RATE } from 'src/utils/constants';
import { Vehicle } from 'src/vehicle/entities/vehicle.entity';
import { VehicleSize } from 'src/vehicle/vehicle.types';
import { Space } from './entities/space.entity';
import { SpaceService } from './space.service';
import { SpaceSize } from './space.types';

describe('SpaceService', () => {
  let service: SpaceService;

  let mockedRepository: Record<string, jest.Mock>;
  let mockedActivityLogService: Record<string, jest.Mock>;
  let mockedEntranceSpaceService: Record<string, jest.Mock>;
  let mockedParkingSessionService: Record<string, jest.Mock>;

  const mockSpace = Space.construct({
    id: 'space-id',
    size: SpaceSize.Small,
  });
  const mockEntranceSpace = EntranceSpace.construct({
    id: 'entrance-space-id',
    distance: 10,
    space: mockSpace,
  });
  const mockActivityLog = ActivityLog.construct({
    id: 'activity-log-id',
  });
  const mockParkingSession = ParkingSession.construct({
    id: 'parking-session-id',
  });

  beforeEach(async () => {
    mockedRepository = {};

    mockedActivityLogService = {
      create: jest.fn().mockResolvedValue(mockActivityLog),
    };
    mockedEntranceSpaceService = {
      findAll: jest.fn(),
    };
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
          provide: ActivityLogService,
          useValue: mockedActivityLogService,
        },
        {
          provide: EntranceSpaceService,
          useValue: mockedEntranceSpaceService,
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
    describe('when there are no spaces assigned to the entrance', () => {
      beforeEach(() => {
        mockedEntranceSpaceService.findAll.mockResolvedValue([]);
      });

      it('returns an empty array', async () => {
        expect(await service.findAllByEntranceId('entrance-id')).toEqual([]);
        expect(mockedEntranceSpaceService.findAll).toHaveBeenCalledWith({
          where: { entranceId: 'entrance-id' },
          relations: ['space'],
        });
      });
    });

    describe('when there are assigned spaces', () => {
      beforeEach(() => {
        mockedEntranceSpaceService.findAll.mockResolvedValue([
          mockEntranceSpace,
        ]);
      });

      it('returns the resulting spaces with distances', async () => {
        expect(await service.findAllByEntranceId('entrance-id')).toEqual([
          {
            ...mockSpace,
            distance: mockEntranceSpace.distance,
          },
        ]);
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
    let isVehicleSizeOnSpaceSizeParkAllowedSpy: jest.SpyInstance;

    describe('when no spaces are assigned to the entrance', () => {
      beforeEach(() => {
        mockedEntranceSpaceService.findAll.mockResolvedValue([]);
        isVehicleSizeOnSpaceSizeParkAllowedSpy = jest.spyOn(
          service,
          'isVehicleSizeOnSpaceSizeParkAllowed',
        );
      });

      it('returns an empty array', async () => {
        expect(
          await service.getAvailableEntranceSpacesForVehicleSize(
            'entrane-id',
            VehicleSize.Large,
          ),
        ).toEqual([]);

        expect(isVehicleSizeOnSpaceSizeParkAllowedSpy).not.toHaveBeenCalled();
      });
    });

    describe('when there are spaces assigned', () => {
      const now = new Date();
      const smallSpace = Space.construct({
        id: 'small-space-id',
        size: SpaceSize.Small,
        activityLogs: [
          ActivityLog.construct({
            id: 'activity-log-1',
            type: ActivityLogType.In,
            createdAt: addHours(now, 1),
          }),
          ActivityLog.construct({
            id: 'activity-log-2',
            type: ActivityLogType.Out,
            createdAt: addHours(now, 2),
          }),
        ],
      });
      const mediumSpace = Space.construct({
        id: 'medium-space-id',
        size: SpaceSize.Medium,
        activityLogs: [
          ActivityLog.construct({
            id: 'activity-log-3',
            type: ActivityLogType.In,
            createdAt: subHours(now, 2),
          }),
        ],
      });
      const largeSpace = Space.construct({
        id: 'large-space-id',
        size: SpaceSize.Large,
        activityLogs: [
          ActivityLog.construct({
            id: 'activity-log-4',
            type: ActivityLogType.In,
            createdAt: subHours(now, 4),
          }),
          ActivityLog.construct({
            id: 'activity-log-5',
            type: ActivityLogType.Out,
            createdAt: subHours(now, 2),
          }),
          ActivityLog.construct({
            id: 'activity-log-6',
            type: ActivityLogType.In,
            createdAt: addHours(now, 5),
          }),
          ActivityLog.construct({
            id: 'activity-log-7',
            type: ActivityLogType.Out,
            createdAt: addHours(now, 7),
          }),
        ],
      });
      const entranceSpaces = [
        EntranceSpace.construct({
          id: 'entrance-space-1',
          space: smallSpace,
          distance: 3,
        }),
        EntranceSpace.construct({
          id: 'entrance-space-2',
          space: mediumSpace,
          distance: 2,
        }),
        EntranceSpace.construct({
          id: 'entrance-space-3',
          space: largeSpace,
          distance: 1,
        }),
      ];

      beforeEach(() => {
        mockedEntranceSpaceService.findAll.mockResolvedValue(entranceSpaces);
        isVehicleSizeOnSpaceSizeParkAllowedSpy = jest.spyOn(
          service,
          'isVehicleSizeOnSpaceSizeParkAllowed',
        );
      });

      it('returns the vacant spaces', async () => {
        expect(
          await service.getAvailableEntranceSpacesForVehicleSize(
            'entrane-id',
            VehicleSize.Medium,
          ),
        ).toEqual([
          {
            ...largeSpace,
            distance: 1,
          },
        ]);
        expect(isVehicleSizeOnSpaceSizeParkAllowedSpy).toHaveBeenCalledTimes(3);
      });
    });
  });

  describe('calculateCost', () => {
    let findOneByIdSpy: jest.SpyInstance;

    beforeEach(() => {
      findOneByIdSpy = jest
        .spyOn(service, 'findOneById')
        .mockResolvedValue(mockSpace);
    });

    /**
     * @todo all tests are assuming that all log hours are all of the same space
     */
    describe('when the space does not exist', () => {
      beforeEach(() => {
        findOneByIdSpy = jest
          .spyOn(service, 'findOneById')
          .mockResolvedValue(null);
      });

      it('returns a NotFoundException', async () => {
        await expect(
          service.calculateCost([
            {
              entranceId: 'entrance-id-1',
              spaceId: 'space-id-1',
              hours: 123,
            },
          ]),
        ).rejects.toThrow(NotFoundException);
        expect(findOneByIdSpy).toHaveBeenCalledWith('space-id-1');
      });
    });

    describe('when the space exists', () => {
      describe('when the total hours are below the minimum flat rate', () => {
        it('returns the flat rate', async () => {
          expect(
            await service.calculateCost([
              {
                entranceId: 'entrance-id-1',
                spaceId: 'space-id-1',
                hours: 2.4,
              },
            ]),
          ).toEqual([
            {
              spaceId: 'space-id-1',
              entranceId: 'entrance-id-1',
              hours: 2.4,
              cost: FLAT_RATE,
            },
          ]);
        });
      });

      describe('when the total hours exceeds the minimum flat rate', () => {
        it('adds the calculated excess hours cost on top of the flat rate', async () => {
          expect(
            await service.calculateCost([
              {
                entranceId: 'entrance-id-1',
                spaceId: 'space-id-1',
                hours: 5,
              },
            ]),
          ).toEqual([
            {
              spaceId: 'space-id-1',
              entranceId: 'entrance-id-1',
              hours: 5,
              cost: 80,
            },
          ]);
        });
      });

      describe('when the excess hours are not of full hours', () => {
        it('adds the calculated rounded excess hours cost on top of the flat rate', async () => {
          expect(
            await service.calculateCost([
              {
                entranceId: 'entrance-id-1',
                spaceId: 'space-id-1',
                hours: 5.2,
              },
            ]),
          ).toEqual([
            {
              spaceId: 'space-id-1',
              entranceId: 'entrance-id-1',
              hours: 5.2,
              cost: 100,
            },
          ]);
        });
      });

      describe('when the total hours is 24 hours', () => {
        it('returns the daily rate', async () => {
          expect(
            await service.calculateCost([
              {
                entranceId: 'entrance-id-1',
                spaceId: 'space-id-1',
                hours: 24,
              },
            ]),
          ).toEqual([
            {
              spaceId: 'space-id-1',
              entranceId: 'entrance-id-1',
              hours: 24,
              cost: DAILY_RATE,
            },
          ]);
        });
      });

      describe('when the total hours is greater than 23 but less than 24', () => {
        it('returns the daily rate', async () => {
          expect(
            await service.calculateCost([
              {
                entranceId: 'entrance-id-1',
                spaceId: 'space-id-1',
                hours: 23.1,
              },
            ]),
          ).toEqual([
            {
              spaceId: 'space-id-1',
              entranceId: 'entrance-id-1',
              hours: 23.1,
              cost: DAILY_RATE,
            },
          ]);
        });
      });

      describe('when the total hours is greater than 24 hours', () => {
        it('adds the calculated rounded excess hours cost of top of the daily rate', async () => {
          expect(
            await service.calculateCost([
              {
                entranceId: 'entrance-id-1',
                spaceId: 'space-id-1',
                hours: 29.2,
              },
            ]),
          ).toEqual([
            {
              spaceId: 'space-id-1',
              entranceId: 'entrance-id-1',
              hours: 29.2,
              cost: 5120,
            },
          ]);
        });
      });

      describe('when the total hours is a multiple of 24', () => {
        it('multiplies the daily rate for every 24 hours', async () => {
          expect(
            await service.calculateCost([
              {
                entranceId: 'entrance-id-1',
                spaceId: 'space-id-1',
                hours: 71.1,
              },
            ]),
          ).toEqual([
            {
              spaceId: 'space-id-1',
              entranceId: 'entrance-id-1',
              hours: 71.1,
              cost: 15000,
            },
          ]);
        });
      });
    });
  });
});
