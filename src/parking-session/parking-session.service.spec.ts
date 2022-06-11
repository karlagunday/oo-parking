import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Entrance } from 'src/entrance/entities/entrance.entity';
import { EntranceService } from 'src/entrance/entrance.service';
import { Space } from 'src/space/entities/space.entity';
import { SpaceService } from 'src/space/space.service';
import { Ticket } from 'src/ticket/entities/ticket.entity';
import { ParkingSession } from './entities/parking-session.entity';
import { ParkingSessionService } from './parking-session.service';
import { ParkingSessionStatus } from './parking-session.types';

describe('ParkingSessionService', () => {
  let service: ParkingSessionService;

  let mockedRepository: Record<string, jest.Mock>;
  let mockedEntranceService: Record<string, jest.Mock>;
  let mockedSpaceService: Record<string, jest.Mock>;

  const mockParkingSession = ParkingSession.construct({
    id: 'session-id',
  });
  const mockEntrance = Entrance.construct({
    id: 'entrance-id',
  });
  const mockSpace = Space.construct({
    id: 'space-id',
  });
  const mockTicket = Ticket.construct({
    id: 'ticket-id',
  });

  beforeEach(async () => {
    mockedRepository = {
      findOneByOrFail: jest.fn(),
      update: jest.fn(),
    };

    mockedEntranceService = {
      findOneById: jest.fn(),
    };
    mockedSpaceService = {
      findOneById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ParkingSessionService,
        {
          provide: ParkingSession.name,
          useValue: mockedRepository,
        },
        {
          provide: EntranceService,
          useValue: mockedEntranceService,
        },
        {
          provide: SpaceService,
          useValue: mockedSpaceService,
        },
      ],
    }).compile();

    service = module.get<ParkingSessionService>(ParkingSessionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOneByTicketIdAndStatus', () => {
    let findOneSpy: jest.SpyInstance;

    beforeEach(() => {
      findOneSpy = jest
        .spyOn(service, 'findOne')
        .mockResolvedValue(mockParkingSession);
    });

    it('returns the resulting session', async () => {
      expect(
        await service.findOneByTicketIdAndStatus(
          'ticket-id',
          ParkingSessionStatus.Started,
        ),
      ).toEqual(mockParkingSession);
      expect(findOneSpy).toHaveBeenCalledWith({
        where: { ticketId: 'ticket-id', status: ParkingSessionStatus.Started },
      });
    });
  });

  describe('getCurrentOfTicketId', () => {
    let findOneByTicketIdAndStatusSpy: jest.SpyInstance;

    beforeEach(() => {
      findOneByTicketIdAndStatusSpy = jest
        .spyOn(service, 'findOneByTicketIdAndStatus')
        .mockResolvedValue(mockParkingSession);
    });

    it('returns the resulting session', async () => {
      expect(await service.getCurrentOfTicketId('ticket-id')).toEqual(
        mockParkingSession,
      );
      expect(findOneByTicketIdAndStatusSpy).toHaveBeenCalledWith(
        'ticket-id',
        ParkingSessionStatus.Started,
      );
    });
  });

  describe('start', () => {
    let getCurrentOfTicketIdSpy: jest.SpyInstance;
    let createSpy: jest.SpyInstance;

    describe('when the entrance is not found', () => {
      beforeEach(() => {
        mockedEntranceService.findOneById.mockResolvedValue(null);
        getCurrentOfTicketIdSpy = jest.spyOn(service, 'getCurrentOfTicketId');
        createSpy = jest.spyOn(service, 'create');
      });

      it('throws NotFoundException', async () => {
        await expect(
          service.start('ticket-id', 'entrance-id', 'space-id'),
        ).rejects.toThrow(NotFoundException);
        expect(mockedEntranceService.findOneById).toHaveBeenCalledWith(
          'entrance-id',
        );

        expect(mockedSpaceService.findOneById).not.toHaveBeenCalled();
        expect(getCurrentOfTicketIdSpy).not.toHaveBeenCalled();
        expect(createSpy).not.toHaveBeenCalled();
      });
    });

    describe('when the space is not found', () => {
      beforeEach(() => {
        mockedEntranceService.findOneById.mockResolvedValue(mockEntrance);
        mockedSpaceService.findOneById.mockResolvedValue(null);
        getCurrentOfTicketIdSpy = jest.spyOn(service, 'getCurrentOfTicketId');
        createSpy = jest.spyOn(service, 'create');
      });

      it('throws NotFoundException', async () => {
        await expect(
          service.start('ticket-id', 'entrance-id', 'space-id'),
        ).rejects.toThrow(NotFoundException);
        expect(mockedEntranceService.findOneById).toHaveBeenCalledWith(
          'entrance-id',
        );
        expect(mockedSpaceService.findOneById).toHaveBeenCalledWith('space-id');

        expect(getCurrentOfTicketIdSpy).not.toHaveBeenCalled();
        expect(createSpy).not.toHaveBeenCalled();
      });
    });

    describe('when the ticket currently has an active session', () => {
      beforeEach(() => {
        mockedEntranceService.findOneById.mockResolvedValue(mockEntrance);
        mockedSpaceService.findOneById.mockResolvedValue(mockSpace);
        getCurrentOfTicketIdSpy = jest
          .spyOn(service, 'getCurrentOfTicketId')
          .mockResolvedValue(mockParkingSession);
        createSpy = jest.spyOn(service, 'create');
      });

      it('throws BadRequestException', async () => {
        await expect(
          service.start('ticket-id', 'entrance-id', 'space-id'),
        ).rejects.toThrow(BadRequestException);
        expect(mockedEntranceService.findOneById).toHaveBeenCalledWith(
          'entrance-id',
        );
        expect(mockedSpaceService.findOneById).toHaveBeenCalledWith('space-id');
        expect(getCurrentOfTicketIdSpy).toHaveBeenCalledWith('ticket-id');

        expect(createSpy).not.toHaveBeenCalled();
      });
    });

    describe('when the ticket does not have an active session', () => {
      const newSession = ParkingSession.construct({
        id: 'new-session',
      });

      beforeEach(() => {
        mockedEntranceService.findOneById.mockResolvedValue(mockEntrance);
        mockedSpaceService.findOneById.mockResolvedValue(mockSpace);
        getCurrentOfTicketIdSpy = jest
          .spyOn(service, 'getCurrentOfTicketId')
          .mockResolvedValue(null);
        createSpy = jest.spyOn(service, 'create').mockResolvedValue(newSession);
      });

      it('creates a new session', async () => {
        expect(
          await service.start('ticket-id', 'entrance-id', 'space-id'),
        ).toEqual(newSession);
        expect(mockedEntranceService.findOneById).toHaveBeenCalledWith(
          'entrance-id',
        );
        expect(mockedSpaceService.findOneById).toHaveBeenCalledWith('space-id');
        expect(getCurrentOfTicketIdSpy).toHaveBeenCalledWith('ticket-id');
        expect(createSpy).toHaveBeenCalledWith(
          ParkingSession.construct({
            ticketId: 'ticket-id',
            status: ParkingSessionStatus.Started,
          }),
        );
      });
    });
  });

  // describe('stop', () => {
  //   let findOneByTicketIdAndStatusSpy: jest.SpyInstance;
  //   let updateSpy: jest.SpyInstance;
  //   let findOneByIdSpy: jest.SpyInstance;

  //   describe('when the ticket does not have an active session', () => {
  //     beforeEach(() => {
  //       findOneByTicketIdAndStatusSpy = jest
  //         .spyOn(service, 'findOneByTicketIdAndStatus')
  //         .mockResolvedValue(null);
  //       updateSpy = jest.spyOn(service, 'update');
  //       findOneByIdSpy = jest.spyOn(service, 'findOneById');
  //     });

  //     it('throws BadRequestException', async () => {
  //       await expect(service.stop('ticket-id')).rejects.toThrow(
  //         BadRequestException,
  //       );
  //       expect(findOneByTicketIdAndStatusSpy).toHaveBeenCalledWith(
  //         'ticket-id',
  //         ParkingSessionStatus.Started,
  //       );

  //       expect(updateSpy).not.toHaveBeenCalled();
  //       expect(findOneByIdSpy).not.toHaveBeenCalled();
  //     });
  //   });

  //   describe('when the ticket has an active session', () => {
  //     const updatedSession = ParkingSession.construct({
  //       id: 'updated-session',
  //     });

  //     beforeEach(() => {
  //       findOneByTicketIdAndStatusSpy = jest
  //         .spyOn(service, 'findOneByTicketIdAndStatus')
  //         .mockResolvedValue(mockParkingSession);
  //       updateSpy = jest.spyOn(service, 'update');
  //       findOneByIdSpy = jest
  //         .spyOn(service, 'findOneById')
  //         .mockResolvedValue(updatedSession);
  //     });

  //     it('ends that session', async () => {
  //       expect(await service.stop('ticket-id')).toEqual(updatedSession);
  //       expect(findOneByTicketIdAndStatusSpy).toHaveBeenCalledWith(
  //         'ticket-id',
  //         ParkingSessionStatus.Started,
  //       );
  //       expect(updateSpy).toHaveBeenCalledWith(
  //         mockParkingSession.id,
  //         expect.objectContaining({
  //           /**
  //            * @todo also check for `endedAt` ?
  //            */
  //           status: ParkingSessionStatus.Ended,
  //         }),
  //       );
  //       expect(findOneByIdSpy).toHaveBeenCalledWith(mockParkingSession.id);
  //     });
  //   });
  // });
});
