import { Test, TestingModule } from '@nestjs/testing';
import { addHours } from 'date-fns';
import { ActivityLogService } from './activity-log.service';
import { ActivityLogType } from './activity-log.types';
import { ActivityLog } from './entities/activity-log.entity';

describe('ActivityLogService', () => {
  let service: ActivityLogService;
  let mockedRepository: Record<string, jest.Mock>;

  const mockActivity = ActivityLog.construct({
    id: 'activity-id',
  });

  beforeEach(async () => {
    mockedRepository = {
      findOne: jest.fn(),
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivityLogService,
        {
          provide: ActivityLog.name,
          useValue: mockedRepository,
        },
      ],
    }).compile();

    service = module.get<ActivityLogService>(ActivityLogService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getLastActivityByVehicleId', () => {
    let findOneSpy: jest.SpyInstance;

    beforeEach(() => {
      findOneSpy = jest
        .spyOn(service, 'findOne')
        .mockResolvedValueOnce(mockActivity);
    });

    it('calls findOne and returns the resulting activity', async () => {
      expect(await service.getLastActivityByVehicleId('vehicle-id')).toEqual(
        mockActivity,
      );

      expect(findOneSpy).toHaveBeenCalledWith({
        where: { vehicleId: 'vehicle-id' },
        order: { createdAt: 'DESC' },
      });
    });

    it('calls findOne with the options and returns the resulting activity', async () => {
      expect(
        await service.getLastActivityByVehicleId('vehicle-id', {
          where: { spaceId: 'some-space-id' },
          order: { updatedAt: 'DESC' },
        }),
      ).toEqual(mockActivity);

      expect(findOneSpy).toHaveBeenCalledWith({
        where: { vehicleId: 'vehicle-id', spaceId: 'some-space-id' },
        order: { createdAt: 'DESC', updatedAt: 'DESC' },
      });
    });
  });

  describe('getLastActivityBySpaceId', () => {
    let findOneSpy: jest.SpyInstance;

    beforeEach(() => {
      findOneSpy = jest
        .spyOn(service, 'findOne')
        .mockResolvedValueOnce(mockActivity);
    });

    it('calls findOne and returns the resulting activity', async () => {
      expect(await service.getLastActivityBySpaceId('space-id')).toEqual(
        mockActivity,
      );

      expect(findOneSpy).toHaveBeenCalledWith({
        where: { spaceId: 'space-id' },
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('getAllByTicketId', () => {
    let findAllSpy: jest.SpyInstance;

    beforeEach(() => {
      findAllSpy = jest
        .spyOn(service, 'findAll')
        .mockResolvedValueOnce([mockActivity]);
    });

    it('calls findAll and return the resulting activities', async () => {
      expect(await service.getAllByTicketId('ticket-id')).toEqual([
        mockActivity,
      ]);

      expect(findAllSpy).toHaveBeenCalledWith({
        where: { ticketId: 'ticket-id' },
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('getFirstActivityByTicketId', () => {
    let findOneSpy: jest.SpyInstance;

    beforeEach(() => {
      findOneSpy = jest
        .spyOn(service, 'findOne')
        .mockResolvedValueOnce(mockActivity);
    });

    it('calls findOne and returns the resulting activity', async () => {
      expect(await service.getFirstActivityByTicketId('ticket-id')).toEqual(
        mockActivity,
      );

      expect(findOneSpy).toHaveBeenCalledWith({
        where: { ticketId: 'ticket-id' },
        order: { createdAt: 'ASC' },
      });
    });

    it('calls findOne with options and returns the resulting activity', async () => {
      expect(
        await service.getFirstActivityByTicketId('ticket-id', {
          where: { vehicleId: 'vehicle-id' },
          order: { updatedAt: 'ASC' },
        }),
      ).toEqual(mockActivity);

      expect(findOneSpy).toHaveBeenCalledWith({
        where: { ticketId: 'ticket-id', vehicleId: 'vehicle-id' },
        order: { createdAt: 'ASC', updatedAt: 'ASC' },
      });
    });
  });

  describe('getLastActivityByTicketId', () => {
    let findOneSpy: jest.SpyInstance;

    beforeEach(() => {
      findOneSpy = jest
        .spyOn(service, 'findOne')
        .mockResolvedValueOnce(mockActivity);
    });

    it('calls findOne and returns the resulting activity', async () => {
      expect(await service.getLastActivityByTicketId('ticket-id')).toEqual(
        mockActivity,
      );

      expect(findOneSpy).toHaveBeenCalledWith({
        where: { ticketId: 'ticket-id' },
        order: { createdAt: 'DESC' },
      });
    });

    it('calls findOne with options and returns the resulting activity', async () => {
      expect(
        await service.getLastActivityByTicketId('ticket-id', {
          where: { vehicleId: 'vehicle-id' },
          order: { updatedAt: 'DESC' },
        }),
      ).toEqual(mockActivity);

      expect(findOneSpy).toHaveBeenCalledWith({
        where: { ticketId: 'ticket-id', vehicleId: 'vehicle-id' },
        order: { createdAt: 'DESC', updatedAt: 'DESC' },
      });
    });
  });

  describe('calculateParkedHoursByTicketId', () => {
    let getFirstActivityByTicketIdSpy: jest.SpyInstance;
    let getLastActivityByTicketIdSpy: jest.SpyInstance;

    const now = new Date();

    const mockFirstActivity = ActivityLog.construct({
      id: 'first-activity',
      createdAt: now,
      type: ActivityLogType.In,
      entranceId: 'entrance-id',
      spaceId: 'space-id',
    });
    const mockLastActivity = ActivityLog.construct({
      id: 'last-activity',
      createdAt: addHours(now, 2),
      type: ActivityLogType.Out,
      entranceId: 'entrance-id',
      spaceId: 'space-id',
    });

    beforeEach(() => {
      getFirstActivityByTicketIdSpy = jest
        .spyOn(service, 'getFirstActivityByTicketId')
        .mockResolvedValueOnce(mockFirstActivity);
      getLastActivityByTicketIdSpy = jest
        .spyOn(service, 'getLastActivityByTicketId')
        .mockResolvedValueOnce(mockLastActivity);
    });

    it('calculates the number of actual parked hours of the ticket', async () => {
      expect(await service.calculateParkedHoursByTicketId('ticket-id')).toEqual(
        [
          {
            entranceId: 'entrance-id',
            spaceId: 'space-id',
            hours: 2,
          },
        ],
      );
      expect(getFirstActivityByTicketIdSpy).toHaveBeenCalledWith('ticket-id', {
        where: { type: ActivityLogType.In },
      });
      expect(getLastActivityByTicketIdSpy).toHaveBeenCalledWith('ticket-id', {
        where: { type: ActivityLogType.Out },
      });
    });
  });
});
