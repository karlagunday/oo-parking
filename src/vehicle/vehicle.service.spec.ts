import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ActivityLogService } from 'src/activity-log/activity-log.service';
import { EntranceSpaceService } from 'src/entrance-space/entrance-space.service';
import { EntranceService } from 'src/entrance/entrance.service';
import { SpaceService } from 'src/space/space.service';
import { Ticket } from 'src/ticket/entities/ticket.entity';
import { TicketService } from 'src/ticket/ticket.service';
import { Vehicle } from './entities/vehicle.entity';
import { VehicleService } from './vehicle.service';

describe('VehicleService', () => {
  let service: VehicleService;

  let mockedRepository: Record<string, jest.Mock>;
  let mockedEntranceService: Record<string, jest.Mock>;
  let mockedActivityLogService: Record<string, jest.Mock>;
  let mockedSpaceService: Record<string, jest.Mock>;
  let mockedEntranceSpaceService: Record<string, jest.Mock>;
  let mockedTicketService: Record<string, jest.Mock>;

  const mockVehicle = Vehicle.construct({
    id: 'vehicle-id',
  });
  const mockTicket = Ticket.construct({
    id: 'ticket-id',
    number: 55,
  });

  beforeEach(async () => {
    mockedRepository = {
      findOne: jest.fn(),
    };
    mockedEntranceService = {
      enter: jest.fn(),
      exit: jest.fn(),
    };
    mockedActivityLogService = {};
    mockedSpaceService = {};
    mockedEntranceSpaceService = {};
    mockedTicketService = {
      getActiveTicketByVehicleId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehicleService,
        {
          provide: Vehicle.name,
          useValue: mockedRepository,
        },
        {
          provide: EntranceService,
          useValue: mockedEntranceService,
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
          provide: EntranceSpaceService,
          useValue: mockedEntranceSpaceService,
        },
        {
          provide: TicketService,
          useValue: mockedTicketService,
        },
      ],
    }).compile();

    service = module.get<VehicleService>(VehicleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('park', () => {
    let findOneByIdSpy: jest.SpyInstance;
    let isParkedSpy: jest.SpyInstance;

    describe('when the vehicle is not found', () => {
      beforeEach(() => {
        findOneByIdSpy = jest
          .spyOn(service, 'findOneById')
          .mockResolvedValue(null);
        isParkedSpy = jest.spyOn(service, 'isParked');
      });

      it('throws NotFoundException', async () => {
        await expect(service.park('vehicle-id', 'entrance-id')).rejects.toThrow(
          NotFoundException,
        );
        expect(findOneByIdSpy).toHaveBeenCalledWith('vehicle-id');

        expect(isParkedSpy).not.toHaveBeenCalled();
        expect(mockedEntranceService.enter).not.toHaveBeenCalled();
      });
    });

    describe('when the vehicle is already parked', () => {
      beforeEach(() => {
        findOneByIdSpy = jest
          .spyOn(service, 'findOneById')
          .mockResolvedValue(mockVehicle);
        isParkedSpy = jest.spyOn(service, 'isParked').mockResolvedValue(true);
      });

      it('throws BadRequestException', async () => {
        await expect(service.park('vehicle-id', 'entrance-id')).rejects.toThrow(
          BadRequestException,
        );
        expect(findOneByIdSpy).toHaveBeenCalledWith('vehicle-id');
        expect(isParkedSpy).toHaveBeenCalledWith('vehicle-id');

        expect(mockedEntranceService.enter).not.toHaveBeenCalled();
      });
    });

    describe('when the vehicle is not parked', () => {
      beforeEach(() => {
        findOneByIdSpy = jest
          .spyOn(service, 'findOneById')
          .mockResolvedValue(mockVehicle);
        isParkedSpy = jest.spyOn(service, 'isParked').mockResolvedValue(false);
        mockedEntranceService.enter.mockResolvedValue(mockTicket);
      });

      it('returns the ticket of the parked vehicle', async () => {
        expect(await service.park('vehicle-id', 'entrance-id')).toEqual(
          mockTicket,
        );
        expect(findOneByIdSpy).toHaveBeenCalledWith('vehicle-id');
        expect(isParkedSpy).toHaveBeenCalledWith('vehicle-id');
        expect(mockedEntranceService.enter).toHaveBeenCalledWith(
          'entrance-id',
          mockVehicle,
        );
      });
    });
  });

  describe('isParked', () => {
    describe('when there is no active ticket for the vehicle', () => {
      beforeEach(() => {
        mockedTicketService.getActiveTicketByVehicleId.mockResolvedValue(null);
      });

      it('returns false', async () => {
        expect(await service.isParked('vehicle-id')).toBe(false);
        expect(
          mockedTicketService.getActiveTicketByVehicleId,
        ).toHaveBeenCalledWith('vehicle-id');
      });
    });
    describe('when there is an active ticket for the vehicle', () => {
      beforeEach(() => {
        mockedTicketService.getActiveTicketByVehicleId.mockResolvedValue(
          mockTicket,
        );
      });

      it('returns true', async () => {
        expect(await service.isParked('vehicle-id')).toBe(true);
        expect(
          mockedTicketService.getActiveTicketByVehicleId,
        ).toHaveBeenCalledWith('vehicle-id');
      });
    });
  });

  describe('isUnparked', () => {
    let isParkedSpy: jest.SpyInstance;

    describe('when there is an active ticket for the vehicle', () => {
      beforeEach(() => {
        isParkedSpy = jest.spyOn(service, 'isParked').mockResolvedValue(true);
      });

      it('returns false', async () => {
        expect(await service.isUnparked('vehicle-id')).toBe(false);
        expect(isParkedSpy).toHaveBeenCalledWith('vehicle-id');
      });
    });

    describe('when there is no active ticket for the vehicle', () => {
      beforeEach(() => {
        isParkedSpy = jest.spyOn(service, 'isParked').mockResolvedValue(false);
      });

      it('returns true', async () => {
        expect(await service.isUnparked('vehicle-id')).toBe(true);
        expect(isParkedSpy).toHaveBeenCalledWith('vehicle-id');
      });
    });
  });

  describe('unpark', () => {
    let findOneByIdSpy: jest.SpyInstance;
    let isUnparkedSpy: jest.SpyInstance;

    describe('when the vehicle is not found', () => {
      beforeEach(() => {
        findOneByIdSpy = jest
          .spyOn(service, 'findOneById')
          .mockResolvedValue(null);
        isUnparkedSpy = jest.spyOn(service, 'isUnparked');
      });

      it('throws NotFoudnExcepton', async () => {
        await expect(service.unpark('vehicle-id')).rejects.toThrow(
          NotFoundException,
        );
        expect(findOneByIdSpy).toHaveBeenCalledWith('vehicle-id');

        expect(isUnparkedSpy).not.toHaveBeenCalled();
        expect(mockedEntranceService.exit).not.toHaveBeenCalled();
      });
    });

    describe('when the vehicle is not parked', () => {
      beforeEach(() => {
        findOneByIdSpy = jest
          .spyOn(service, 'findOneById')
          .mockResolvedValue(mockVehicle);
        isUnparkedSpy = jest
          .spyOn(service, 'isUnparked')
          .mockResolvedValue(true);
      });

      it('throws BadRequestException', async () => {
        await expect(service.unpark('vehicle-id')).rejects.toThrow(
          BadRequestException,
        );
        expect(findOneByIdSpy).toHaveBeenCalledWith('vehicle-id');
        expect(isUnparkedSpy).toHaveBeenCalledWith('vehicle-id');

        expect(mockedEntranceService.exit).not.toHaveBeenCalled();
      });
    });

    describe('when the vehicle is parked', () => {
      beforeEach(() => {
        findOneByIdSpy = jest
          .spyOn(service, 'findOneById')
          .mockResolvedValue(mockVehicle);
        isUnparkedSpy = jest
          .spyOn(service, 'isUnparked')
          .mockResolvedValue(false);
        mockedEntranceService.exit.mockResolvedValue(mockTicket);
      });

      it('returns the ticket of the unparking vehicle', async () => {
        expect(await service.unpark('vehicle-id')).toEqual(mockTicket);

        expect(findOneByIdSpy).toHaveBeenCalledWith('vehicle-id');
        expect(isUnparkedSpy).toHaveBeenCalledWith('vehicle-id');
        expect(mockedEntranceService.exit).toHaveBeenCalledWith(mockVehicle);
      });
    });
  });
});
