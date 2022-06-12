import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { subHours, subMinutes } from 'date-fns';
import { ParkingSession } from 'src/parking-session/entities/parking-session.entity';
import { ParkingSessionService } from 'src/parking-session/parking-session.service';
import { SpaceService } from 'src/space/space.service';
import { Vehicle } from 'src/vehicle/entities/vehicle.entity';
import { IsNull, Not } from 'typeorm';
import { Ticket } from './entities/ticket.entity';
import { TicketService } from './ticket.service';
import { TicketStatus } from './ticket.types';

describe('TicketService', () => {
  let service: TicketService;
  let mockedRepository: Record<string, jest.Mock>;

  let mockedSpaceService: Record<string, jest.Mock>;
  let mockedParkingSessionService: Record<string, jest.Mock>;

  const mockTicket = Ticket.construct({
    id: 'ticket-id',
    totalCost: 80,
    actualHours: 6.6,
    paidHours: 7,
    remainingHours: 0.4,
  });
  const mockVehicle = Vehicle.construct({
    id: 'vehicle-id',
  });
  const mockParkingSession = ParkingSession.construct({
    id: 'session-id',
    cost: 20,
    totalHours: 2,
    paidHours: 1.6,
    endedAt: new Date(),
  });

  beforeEach(async () => {
    mockedRepository = {
      findOne: jest.fn(),
      findOneByOrFail: jest.fn(),
      update: jest.fn(),
    };

    mockedSpaceService = {
      calculateCost: jest.fn(),
    };
    mockedParkingSessionService = {
      stop: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketService,
        {
          provide: Ticket.name,
          useValue: mockedRepository,
        },
        {
          provide: SpaceService,
          useValue: mockedSpaceService,
        },
        {
          provide: ParkingSessionService,
          useValue: mockedParkingSessionService,
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

    describe('when there is no active ticket for the vehicle', () => {
      beforeEach(() => {
        getActiveTicketByVehicleIdSpy = jest
          .spyOn(service, 'getActiveTicketByVehicleId')
          .mockResolvedValue(null);
        updateSpy = jest.spyOn(service, 'update');
        findOneByIdSpy = jest.spyOn(service, 'findOneById');
      });

      it('throws BadRequestException', async () => {
        await expect(service.checkOutVehicle(mockVehicle)).rejects.toThrow(
          BadRequestException,
        );
        expect(getActiveTicketByVehicleIdSpy).toHaveBeenCalledWith(
          mockVehicle.id,
        );

        expect(mockedParkingSessionService.stop).not.toHaveBeenCalled();
        expect(updateSpy).not.toHaveBeenCalled();
        expect(findOneByIdSpy).not.toHaveBeenCalled();
      });
    });

    describe('when there is an active ticket for the vehicle', () => {
      const updatedTicket = Ticket.construct({
        id: 'updated-ticket',
      });

      beforeEach(() => {
        getActiveTicketByVehicleIdSpy = jest
          .spyOn(service, 'getActiveTicketByVehicleId')
          .mockResolvedValue(mockTicket);
        mockedParkingSessionService.stop.mockResolvedValue(mockParkingSession);
        updateSpy = jest.spyOn(service, 'update');
        findOneByIdSpy = jest
          .spyOn(service, 'findOneById')
          .mockResolvedValue(updatedTicket);
      });

      it('stops the active session, calculates the cost and returns the updated ticket', async () => {
        expect(await service.checkOutVehicle(mockVehicle)).toEqual(
          updatedTicket,
        );
        expect(getActiveTicketByVehicleIdSpy).toHaveBeenCalledWith(
          mockVehicle.id,
        );
        expect(mockedParkingSessionService.stop).toHaveBeenCalledWith(
          mockTicket,
        );
        expect(updateSpy).toHaveBeenCalledWith(mockTicket.id, {
          totalCost: 100,
          actualHours: 8.6,
          paidHours: 9,
          remainingHours: 9 - 8.6,
          completedAt: mockParkingSession.endedAt,
          status: TicketStatus.Completed,
        });
        expect(findOneByIdSpy).toHaveBeenCalledWith(mockTicket.id, {
          relations: ['parkingSessions'],
        });
      });
    });
  });
});
