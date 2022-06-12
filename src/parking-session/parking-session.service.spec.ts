import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { addDays, addHours, addMinutes } from 'date-fns';
import { Entrance } from 'src/entrance/entities/entrance.entity';
import { EntranceService } from 'src/entrance/entrance.service';
import { Space } from 'src/space/entities/space.entity';
import { SpaceService } from 'src/space/space.service';
import { SpaceSize } from 'src/space/space.types';
import { Ticket } from 'src/ticket/entities/ticket.entity';
import { DAILY_RATE, FLAT_RATE } from 'src/utils/constants';
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

    it('calls findOne and returns the resulting session', async () => {
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

    it('calls findOne with options and returns the resulting session if options are provided', async () => {
      expect(
        await service.findOneByTicketIdAndStatus(
          'ticket-id',
          ParkingSessionStatus.Started,
          {
            where: { cost: 123 },
            order: { createdAt: 'DESC' },
          },
        ),
      ).toEqual(mockParkingSession);
      expect(findOneSpy).toHaveBeenCalledWith({
        where: {
          ticketId: 'ticket-id',
          status: ParkingSessionStatus.Started,
          cost: 123,
        },
        order: { createdAt: 'DESC' },
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

    it('calls findOneByTicketIdAndStatus and returns the resulting session', async () => {
      expect(await service.getCurrentOfTicketId('ticket-id')).toEqual(
        mockParkingSession,
      );
      expect(findOneByTicketIdAndStatusSpy).toHaveBeenCalledWith(
        'ticket-id',
        ParkingSessionStatus.Started,
        {},
      );
    });

    it('calls findOneByTicketIdAndStatus with options and returns the resulting session', async () => {
      expect(
        await service.getCurrentOfTicketId('ticket-id', {
          where: { cost: 123 },
          order: { createdAt: 'DESC' },
        }),
      ).toEqual(mockParkingSession);
      expect(findOneByTicketIdAndStatusSpy).toHaveBeenCalledWith(
        'ticket-id',
        ParkingSessionStatus.Started,
        {
          where: { cost: 123 },
          order: { createdAt: 'DESC' },
        },
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

  describe('stop', () => {
    let calculateActiveSessionCostOfTicketSpy: jest.SpyInstance;
    let updateSpy: jest.SpyInstance;
    let findOneSpy: jest.SpyInstance;

    const mockToday = new Date('2022-01-01');
    const updatedSession = ParkingSession.construct({
      id: 'session-id',
    });

    beforeAll(() => {
      jest.useFakeTimers('modern').setSystemTime(mockToday);
    });
    afterAll(() => {
      jest.useRealTimers();
    });

    beforeEach(() => {
      calculateActiveSessionCostOfTicketSpy = jest
        .spyOn(service, 'calculateActiveSessionCostOfTicket')
        .mockResolvedValue({
          cost: 123,
          totalHours: 6,
          hoursBeingPaid: 5.5,
          parkingSession: mockParkingSession,
        });
      updateSpy = jest.spyOn(service, 'update');
      findOneSpy = jest
        .spyOn(service, 'findOneById')
        .mockResolvedValue(updatedSession);
    });

    it('calculates the cost, stops and returns the stopped session', async () => {
      expect(await service.stop(mockTicket)).toEqual(updatedSession);
      expect(calculateActiveSessionCostOfTicketSpy).toHaveBeenCalledWith(
        mockTicket,
        mockToday,
      );
      expect(updateSpy).toHaveBeenCalledWith(mockParkingSession.id, {
        endedAt: mockToday,
        cost: 123,
        totalHours: 6,
        paidHours: 5.5,
        status: ParkingSessionStatus.Ended,
      });
      expect(findOneSpy).toHaveBeenCalledWith(mockParkingSession.id);
    });
  });

  describe('calculateActiveSessionCostOfTicket', () => {
    let getCurrentOfTicketIdSpy: jest.SpyInstance;

    describe('when the ticket does not have an active session', () => {
      beforeEach(() => {
        getCurrentOfTicketIdSpy = jest
          .spyOn(service, 'getCurrentOfTicketId')
          .mockResolvedValue(null);
      });

      it('throws BadRequestException', async () => {
        await expect(
          service.calculateActiveSessionCostOfTicket(mockTicket, new Date()),
        ).rejects.toThrow(BadRequestException);
        expect(getCurrentOfTicketIdSpy).toHaveBeenCalledWith(mockTicket.id, {
          relations: ['space'],
        });
      });
    });

    describe('when the ticket has an active session', () => {
      const mockSmallSpace = Space.construct({
        id: 'sm-space',
        size: SpaceSize.Small,
      });
      const now = new Date();
      const smallSpaceParkingSession = ParkingSession.construct({
        id: 'small-session',
        space: mockSmallSpace,
        startedAt: now,
      });

      beforeEach(() => {
        getCurrentOfTicketIdSpy = jest
          .spyOn(service, 'getCurrentOfTicketId')
          .mockResolvedValue(smallSpaceParkingSession);
      });

      describe('when the ticket does not have previous costs, actual, paid and remaining hours', () => {
        const newTicket = Ticket.construct({
          id: 'new-ticket',
          totalCost: 0,
          actualHours: 0,
          paidHours: 0,
          remainingHours: 0,
        });

        describe('when the session hours is below 24 hours', () => {
          describe('when the session is below the flat rate hours', () => {
            const sessionEndTime = addHours(now, 2);

            it('returns the flat rate cost', async () => {
              expect(
                await service.calculateActiveSessionCostOfTicket(
                  newTicket,
                  sessionEndTime,
                ),
              ).toEqual({
                cost: FLAT_RATE,
                hoursBeingPaid: 2,
                totalHours: 2,
                parkingSession: smallSpaceParkingSession,
              });
            });
          });

          describe('when the session is above the flat rate hours', () => {
            // 3 hours and 20 minutes
            const sessionEndTime = addMinutes(now, 200);

            it('returns the flat rate cost + rounded excess hours cost', async () => {
              expect(
                await service.calculateActiveSessionCostOfTicket(
                  newTicket,
                  sessionEndTime,
                ),
              ).toEqual({
                cost: 60,
                hoursBeingPaid: 3.333,
                totalHours: 3.333,
                parkingSession: smallSpaceParkingSession,
              });
            });
          });
        });

        describe('when the session is 24 hours', () => {
          const sessionEndTime = addDays(now, 1);
          it('returns the daily rate cost', async () => {
            expect(
              await service.calculateActiveSessionCostOfTicket(
                newTicket,
                sessionEndTime,
              ),
            ).toEqual({
              cost: DAILY_RATE,
              hoursBeingPaid: 24,
              totalHours: 24,
              parkingSession: smallSpaceParkingSession,
            });
          });
        });

        describe('when the session is more than 24 hours', () => {
          describe('when the excess hours is below 24 hours', () => {
            // 1 day, 6 hours and 40 minutes
            const sessionEndTime = addMinutes(now, 1840);

            it('returns the daily rate + rounded excess hours cost', async () => {
              expect(
                await service.calculateActiveSessionCostOfTicket(
                  newTicket,
                  sessionEndTime,
                ),
              ).toEqual({
                cost: 5140,
                hoursBeingPaid: 30.667,
                totalHours: 30.667,
                parkingSession: smallSpaceParkingSession,
              });
            });
          });

          describe('when the excess is a multiple of 24', () => {
            // 3 days, 5 hours and 1 minute
            const sessionEndTime = addMinutes(now, 4621);

            it('returns the daily rate multipled by each 24-hour chunks + rounded excess hours cost', async () => {
              expect(
                await service.calculateActiveSessionCostOfTicket(
                  newTicket,
                  sessionEndTime,
                ),
              ).toEqual({
                cost: 15120,
                hoursBeingPaid: 77.017,
                totalHours: 77.017,
                parkingSession: smallSpaceParkingSession,
              });
            });
          });
        });
      });

      describe('when the ticket has previous costs, actual, paid and remaining hours', () => {
        const reissuedTicket = Ticket.construct({
          id: 'reissued-ticket',
          totalCost: 40,
          actualHours: 0.1,
          paidHours: 3,
          remainingHours: 2.9,
        });

        describe('when the current session hours + ticket actual hours < 24 hours', () => {
          describe('when current session hours + ticket actual hours is < 3 hours', () => {
            const sessionEndTime = addMinutes(now, 50);

            it('returns 0', async () => {
              expect(
                await service.calculateActiveSessionCostOfTicket(
                  reissuedTicket,
                  sessionEndTime,
                ),
              ).toEqual({
                cost: 0,
                hoursBeingPaid: 0.833, // 50 minutes
                totalHours: 0.833,
                parkingSession: smallSpaceParkingSession,
              });
            });
          });

          describe('when the current session hours + ticket actual hours > 3 hours', () => {
            describe('when the ticket remaining hours > session hours', () => {
              const enoughRemainingHoursTicket = Ticket.construct({
                id: 'reissued-ticket',
                totalCost: 80,
                actualHours: 4.1,
                paidHours: 5,
                remainingHours: 0.9,
              });

              const sessionEndTime = addMinutes(now, 20);

              it('returns 0', async () => {
                expect(
                  await service.calculateActiveSessionCostOfTicket(
                    enoughRemainingHoursTicket,
                    sessionEndTime,
                  ),
                ).toEqual({
                  cost: 0,
                  hoursBeingPaid: 0.333, // 20 minutes
                  totalHours: 0.333,
                  parkingSession: smallSpaceParkingSession,
                });
              });
            });

            describe('when the ticket remaining hours < session hours', () => {
              // 5 hours and 33 minutes
              const sessionEndTime = addMinutes(now, 333);

              it('returns the rounded excess hours cost', async () => {
                expect(
                  await service.calculateActiveSessionCostOfTicket(
                    reissuedTicket,
                    sessionEndTime,
                  ),
                ).toEqual({
                  cost: 60, // rounded hoursBeingPaid (3 hours) cost
                  hoursBeingPaid: 2.65, // session hours 5.55 - ticket remaining hours 2.9
                  totalHours: 5.55, // 5 hours and 33 minutes
                  parkingSession: smallSpaceParkingSession,
                });
              });
            });
          });
        });

        describe('when the current session hours + ticket actual hours > 24 hours', () => {
          describe('when the ticket hours < 24 hours', () => {
            // 25 hours
            const sessionEndTime = addMinutes(now, 1500);

            it('returns the daily rate + rounded excess hours cost', async () => {
              expect(
                await service.calculateActiveSessionCostOfTicket(
                  reissuedTicket,
                  sessionEndTime,
                ),
              ).toEqual({
                cost: 5000, // rounded total hours (hoursBeingPaid + ticket.actual hours) cost - ticket.totalCost
                hoursBeingPaid: 22.1, // session hours 22 - ticket remaining hours 2.9
                totalHours: 25, // 22 hours
                parkingSession: smallSpaceParkingSession,
              });
            });
          });

          describe('when the ticket hours > 24 hours', () => {
            const dayReissuedTicket = Ticket.construct({
              id: 'day-ticket',
              totalCost: 5020,
              actualHours: 24.3,
              paidHours: 25,
              remainingHours: 0.7,
            });

            // 4 hours and 20 minutes
            const sessionEndTime = addMinutes(now, 260);

            it('returns the rounded excess hours cost', async () => {
              expect(
                await service.calculateActiveSessionCostOfTicket(
                  dayReissuedTicket,
                  sessionEndTime,
                ),
              ).toEqual({
                cost: 80, // rounded hoursBeingPaid cost
                hoursBeingPaid: 3.633, // session hours 4.3 - ticket remaining hours 0.7
                totalHours: 4.333, // 4 hours and 20 minutes
                parkingSession: smallSpaceParkingSession,
              });
            });
          });
        });
      });
    });
  });
});
