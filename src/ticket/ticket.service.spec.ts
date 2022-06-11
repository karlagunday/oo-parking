import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { subHours, subMinutes } from 'date-fns';
import { ActivityLogService } from 'src/activity-log/activity-log.service';
import {
  ActivityLogTotalHours,
  ActivityLogType,
} from 'src/activity-log/activity-log.types';
import { ActivityLog } from 'src/activity-log/entities/activity-log.entity';
import { ParkingSessionService } from 'src/parking-session/parking-session.service';
import { SpaceService } from 'src/space/space.service';
import { SpaceCalculationResult } from 'src/space/space.types';
import { Vehicle } from 'src/vehicle/entities/vehicle.entity';
import { IsNull, Not } from 'typeorm';
import { Ticket } from './entities/ticket.entity';
import { TicketService } from './ticket.service';
import { TicketStatus } from './ticket.types';

describe('TicketService', () => {
  let service: TicketService;
  let mockedRepository: Record<string, jest.Mock>;

  let mockedActivityLogService: Record<string, jest.Mock>;
  let mockedSpaceService: Record<string, jest.Mock>;

  const mockTicket = Ticket.construct({
    id: 'ticket-id',
  });
  const mockVehicle = Vehicle.construct({
    id: 'vehicle-id',
  });

  beforeEach(async () => {
    mockedRepository = {
      findOne: jest.fn(),
      findOneByOrFail: jest.fn(),
      update: jest.fn(),
    };

    mockedActivityLogService = {
      calculateParkedHoursByTicketId: jest.fn(),
      create: jest.fn(),
      getLastActivityByVehicleId: jest.fn(),
    };
    mockedSpaceService = {
      calculateCost: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketService,
        {
          provide: Ticket.name,
          useValue: mockedRepository,
        },
        {
          provide: ActivityLogService,
          useValue: mockedActivityLogService,
        },
        {
          provide: SpaceService,
          useValue: mockedSpaceService,
        },
        {
          provide: ParkingSessionService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<TicketService>(TicketService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getActiveTicketByVehicleId', () => {
    let findOneSpy: jest.SpyInstance;

    describe('when there is no active ticket for the vehicle', () => {
      beforeEach(() => {
        findOneSpy = jest.spyOn(service, 'findOne').mockResolvedValue(null);
      });

      it('returns null', async () => {
        expect(
          await service.getActiveTicketByVehicleId('vehicle-id'),
        ).toBeNull();
        expect(findOneSpy).toHaveBeenCalledWith({
          where: { vehicleId: 'vehicle-id', status: TicketStatus.Active },
          order: { createdAt: 'DESC' },
        });
      });
    });

    describe('when there is an active ticket', () => {
      beforeEach(() => {
        findOneSpy = jest
          .spyOn(service, 'findOne')
          .mockResolvedValue(mockTicket);
      });

      it('returns the resulting ticket', async () => {
        expect(await service.getActiveTicketByVehicleId('vehicle-id')).toEqual(
          mockTicket,
        );
        expect(findOneSpy).toHaveBeenCalledWith({
          where: { vehicleId: 'vehicle-id', status: TicketStatus.Active },
          order: { createdAt: 'DESC' },
        });
      });
    });
  });

  describe('getTicketForVehicle', () => {
    let findOneSpy: jest.SpyInstance;
    let updateSpy: jest.SpyInstance;
    let findOneByIdSpy: jest.SpyInstance;
    let createSpy: jest.SpyInstance;

    const newTicket = Ticket.construct({
      id: 'new-ticket',
    });

    describe('when there is no previous tickets issued for the vehicle', () => {
      beforeEach(() => {
        findOneSpy = jest.spyOn(service, 'findOne').mockResolvedValue(null);
        updateSpy = jest.spyOn(service, 'update');
        findOneByIdSpy = jest.spyOn(service, 'findOneById');
        createSpy = jest.spyOn(service, 'create').mockResolvedValue(newTicket);
      });

      it('issues a new ticket', async () => {
        expect(await service.getTicketForVehicle(mockVehicle)).toEqual(
          newTicket,
        );
        expect(findOneSpy).toHaveBeenCalledWith({
          where: {
            vehicleId: mockVehicle.id,
            status: TicketStatus.Completed,
            completedAt: Not(IsNull()),
          },
          order: { completedAt: 'DESC' },
        });
        expect(createSpy).toHaveBeenCalledWith(
          Ticket.construct({
            vehicleId: mockVehicle.id,
            status: TicketStatus.Active,
          }),
        );

        expect(updateSpy).not.toHaveBeenCalled();
        expect(findOneByIdSpy).not.toHaveBeenCalled();
      });
    });

    describe('when there is a previous ticket issued for the vehicle', () => {
      describe('when the ticket was marked as completed less than an hour ago', () => {
        const completedTicket = Ticket.construct({
          id: 'completed-ticket',
          completedAt: subMinutes(new Date(), 43),
        });

        beforeEach(() => {
          findOneSpy = jest
            .spyOn(service, 'findOne')
            .mockResolvedValue(completedTicket);
          updateSpy = jest.spyOn(service, 'update');
          findOneByIdSpy = jest
            .spyOn(service, 'findOneById')
            .mockResolvedValue(completedTicket);
          createSpy = jest.spyOn(service, 'create');
        });

        it('reissues that same ticket', async () => {
          expect(await service.getTicketForVehicle(mockVehicle)).toEqual(
            completedTicket,
          );
          expect(findOneSpy).toHaveBeenCalledWith({
            where: {
              vehicleId: mockVehicle.id,
              status: TicketStatus.Completed,
              completedAt: Not(IsNull()),
            },
            order: { completedAt: 'DESC' },
          });
          expect(updateSpy).toHaveBeenCalledWith(completedTicket.id, {
            status: TicketStatus.Active,
            completedAt: null,
          });
          expect(findOneByIdSpy).toHaveBeenCalledWith(completedTicket.id);

          expect(createSpy).not.toHaveBeenCalled();
        });
      });

      describe('when the ticket was marked as complete for more than an hour', () => {
        const completedTicket = Ticket.construct({
          id: 'completed-ticket',
          completedAt: subHours(new Date(), 2),
        });

        beforeEach(() => {
          findOneSpy = jest
            .spyOn(service, 'findOne')
            .mockResolvedValue(completedTicket);
          updateSpy = jest.spyOn(service, 'update');
          findOneByIdSpy = jest.spyOn(service, 'findOneById');
          createSpy = jest
            .spyOn(service, 'create')
            .mockResolvedValue(newTicket);
        });

        it('issues a new ticket', async () => {
          expect(await service.getTicketForVehicle(mockVehicle)).toEqual(
            newTicket,
          );
          expect(findOneSpy).toHaveBeenCalledWith({
            where: {
              vehicleId: mockVehicle.id,
              status: TicketStatus.Completed,
              completedAt: Not(IsNull()),
            },
            order: { completedAt: 'DESC' },
          });
          expect(createSpy).toHaveBeenCalledWith(
            Ticket.construct({
              vehicleId: mockVehicle.id,
              status: TicketStatus.Active,
            }),
          );

          expect(updateSpy).not.toHaveBeenCalled();
          expect(findOneByIdSpy).not.toHaveBeenCalled();
        });
      });
    });
  });

  describe('checkOutVehicle', () => {
    let getActiveTicketByVehicleIdSpy: jest.SpyInstance;
    let updateSpy: jest.SpyInstance;
    let findOneByIdSpy: jest.SpyInstance;

    const inActivity = ActivityLog.construct({
      id: 'in-activity-id',
      entranceId: 'in-entrance-id',
      spaceId: 'in-space-id',
      type: ActivityLogType.In,
    });
    const outActivity = ActivityLog.construct({
      id: 'out-activity-id',
      entranceId: 'out-entrance-id',
      spaceId: 'out-space-id',
      type: ActivityLogType.Out,
      createdAt: new Date(),
    });
    const updatedTicket = Ticket.construct({
      id: 'updated-ticket',
    });

    describe('when the vehicle is not currently parked', () => {
      beforeEach(() => {
        getActiveTicketByVehicleIdSpy = jest
          .spyOn(service, 'getActiveTicketByVehicleId')
          .mockResolvedValue(mockTicket);
        mockedActivityLogService.getLastActivityByVehicleId.mockResolvedValue(
          outActivity,
        );
        updateSpy = jest.spyOn(service, 'update');
        findOneByIdSpy = jest.spyOn(service, 'findOneById');
      });

      it('throwns a BadRequestException', async () => {
        await expect(service.checkOutVehicle(mockVehicle)).rejects.toThrow(
          BadRequestException,
        );
        expect(getActiveTicketByVehicleIdSpy).toHaveBeenCalledWith(
          mockVehicle.id,
        );
        expect(
          mockedActivityLogService.getLastActivityByVehicleId,
        ).toHaveBeenCalledWith(mockVehicle.id);

        expect(mockedActivityLogService.create).not.toHaveBeenCalled();
        expect(
          mockedActivityLogService.calculateParkedHoursByTicketId,
        ).not.toHaveBeenCalled();
        expect(mockedSpaceService.calculateCost).not.toHaveBeenCalled();
        expect(updateSpy).not.toHaveBeenCalled();
        expect(findOneByIdSpy).not.toHaveBeenCalled();
      });
    });

    describe('when the vehicle is parked', () => {
      const logHours: ActivityLogTotalHours[] = [
        {
          entranceId: 'entrance-id-1',
          spaceId: 'space-id-1',
          hours: 5,
        },
        {
          entranceId: 'entrance-id-1',
          spaceId: 'space-id-2',
          hours: 27,
        },
      ];
      const spaceCalculations: SpaceCalculationResult[] = [
        {
          spaceId: 'space-id-1',
          entranceId: 'entrance-id-1',
          hours: 5,
          cost: 1000,
        },
        {
          spaceId: 'space-id-1',
          entranceId: 'entrance-id-2',
          hours: 27,
          cost: 100,
        },
      ];

      beforeEach(() => {
        getActiveTicketByVehicleIdSpy = jest
          .spyOn(service, 'getActiveTicketByVehicleId')
          .mockResolvedValue(mockTicket);
        mockedActivityLogService.getLastActivityByVehicleId.mockResolvedValue(
          inActivity,
        );
        mockedActivityLogService.create.mockResolvedValue(outActivity);
        mockedActivityLogService.calculateParkedHoursByTicketId.mockResolvedValue(
          logHours,
        );
        mockedSpaceService.calculateCost.mockResolvedValue(spaceCalculations);
        updateSpy = jest.spyOn(service, 'update');
        findOneByIdSpy = jest
          .spyOn(service, 'findOneById')
          .mockResolvedValue(updatedTicket);
      });

      it('checks out the vehicle', async () => {
        expect(await service.checkOutVehicle(mockVehicle)).toEqual({
          ticket: updatedTicket,
          breakdown: spaceCalculations,
        });
        expect(getActiveTicketByVehicleIdSpy).toHaveBeenCalledWith(
          mockVehicle.id,
        );
        expect(
          mockedActivityLogService.getLastActivityByVehicleId,
        ).toHaveBeenCalledWith(mockVehicle.id);
        expect(mockedActivityLogService.create).toHaveBeenCalledWith(
          ActivityLog.construct({
            entranceId: inActivity.entranceId,
            spaceId: inActivity.spaceId,
            vehicleId: mockVehicle.id,
            ticketId: mockTicket.id,
            type: ActivityLogType.Out,
          }),
        );
        expect(
          mockedActivityLogService.calculateParkedHoursByTicketId,
        ).toHaveBeenCalledWith(mockTicket.id);
        expect(mockedSpaceService.calculateCost).toHaveBeenCalledWith(logHours);
        expect(updateSpy).toHaveBeenCalledWith(mockTicket.id, {
          status: TicketStatus.Completed,
          cost: 1100,
          hours: 32,
          completedAt: outActivity.createdAt,
        });
        expect(findOneByIdSpy).toHaveBeenCalledWith(mockTicket.id);
      });
    });
  });
});
