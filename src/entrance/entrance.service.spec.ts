import {
  BadRequestException,
  MethodNotAllowedException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { EntranceSpace } from 'src/entrance-space/entities/entrance-space.entity';
import { EntranceSpaceService } from 'src/entrance-space/entrance-space.service';
import { Space } from 'src/space/entities/space.entity';
import { SpaceService } from 'src/space/space.service';
import { SpaceWithDistance } from 'src/space/space.types';
import { Ticket } from 'src/ticket/entities/ticket.entity';
import { TicketService } from 'src/ticket/ticket.service';
import { Vehicle } from 'src/vehicle/entities/vehicle.entity';
import { VehicleSize } from 'src/vehicle/vehicle.types';
import { Entrance } from './entities/entrance.entity';
import { EntranceService } from './entrance.service';

describe('EntranceService', () => {
  let service: EntranceService;
  let mockedRepository: Record<string, jest.Mock>;

  let mockedSpaceService: Record<string, jest.Mock>;
  let mockedEntranceSpaceService: Record<string, jest.Mock>;
  let mockedTicketService: Record<string, jest.Mock>;

  const mockEntrance = Entrance.construct({
    id: 'entrance-id',
  });
  const mockSpace = Space.construct({
    id: 'space-id',
  });
  const mockVehicle = Vehicle.construct({
    id: 'vehicle-id',
    size: VehicleSize.Medium,
  });
  const mockTicket = Ticket.construct({
    id: 'ticket-id',
  });

  beforeEach(async () => {
    mockedRepository = {};

    mockedSpaceService = {
      findOneById: jest.fn(),
      findAllByEntranceId: jest.fn(),
      occupy: jest.fn(),
      getAvailableEntranceSpacesForVehicleSize: jest.fn(),
    };
    mockedEntranceSpaceService = {
      create: jest.fn(),
    };
    mockedTicketService = {
      findOneById: jest.fn(),
      getTicketForVehicle: jest.fn(),
      checkOutVehicle: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EntranceService,
        {
          provide: Entrance.name,
          useValue: mockedRepository,
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

    service = module.get<EntranceService>(EntranceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('assignSpaceById', () => {
    let findOneByIdSpy: jest.SpyInstance;

    describe('when the entrance does not exists', () => {
      beforeEach(() => {
        findOneByIdSpy = jest
          .spyOn(service, 'findOneById')
          .mockResolvedValueOnce(null);
      });

      it('throws NotFoundException', async () => {
        await expect(
          service.assignSpaceById('entrance-id', {
            spaceId: 'space-id',
            distance: 1,
          }),
        ).rejects.toThrow(NotFoundException);
        expect(findOneByIdSpy).toHaveBeenCalledWith('entrance-id');

        expect(mockedSpaceService.findOneById).not.toHaveBeenCalled();
        expect(mockedSpaceService.findAllByEntranceId).not.toHaveBeenCalled();
        expect(mockedEntranceSpaceService.create).not.toHaveBeenCalled();
      });
    });

    describe('when the space does not exists', () => {
      beforeEach(() => {
        findOneByIdSpy = jest
          .spyOn(service, 'findOneById')
          .mockResolvedValueOnce(mockEntrance);

        mockedSpaceService.findOneById.mockResolvedValueOnce(null);
      });

      it('throws a NotFoundException', async () => {
        await expect(
          service.assignSpaceById('entrance-id', {
            spaceId: 'space-id',
            distance: 1,
          }),
        ).rejects.toThrow(NotFoundException);
        expect(findOneByIdSpy).toHaveBeenCalledWith('entrance-id');
        expect(mockedSpaceService.findOneById).toHaveBeenCalledWith('space-id');

        expect(mockedSpaceService.findAllByEntranceId).not.toHaveBeenCalled();
        expect(mockedEntranceSpaceService.create).not.toHaveBeenCalled();
      });
    });

    describe('when the space is already assigned to the entrance', () => {
      beforeEach(() => {
        findOneByIdSpy = jest
          .spyOn(service, 'findOneById')
          .mockResolvedValueOnce(mockEntrance);
        mockedSpaceService.findOneById.mockResolvedValueOnce(mockSpace);
        mockedSpaceService.findAllByEntranceId.mockResolvedValueOnce([
          mockSpace,
        ]);
      });

      it('throws a BadRequestException', async () => {
        await expect(
          service.assignSpaceById('entrance-id', {
            spaceId: 'space-id',
            distance: 1,
          }),
        ).rejects.toThrow(BadRequestException);
        expect(findOneByIdSpy).toHaveBeenCalledWith('entrance-id');
        expect(mockedSpaceService.findOneById).toHaveBeenCalledWith('space-id');
        expect(mockedSpaceService.findAllByEntranceId).toHaveBeenCalledWith(
          'entrance-id',
        );

        expect(mockedEntranceSpaceService.create).not.toHaveBeenCalled();
      });
    });

    describe('when the space is not yet assigned', () => {
      const mockSpaces = [
        Space.construct({
          id: 'test-space',
        }),
      ];
      const mockEntranceSpace = Symbol(`mockEntranceSpace`);

      beforeEach(() => {
        findOneByIdSpy = jest
          .spyOn(service, 'findOneById')
          .mockResolvedValueOnce(mockEntrance);
        mockedSpaceService.findOneById.mockResolvedValueOnce(mockSpace);
        mockedSpaceService.findAllByEntranceId.mockResolvedValueOnce(
          mockSpaces,
        );
        mockedEntranceSpaceService.create.mockResolvedValueOnce(
          mockEntranceSpace,
        );
      });

      it('returns the resulting entrance space assignment', async () => {
        expect(
          await service.assignSpaceById('entrance-id', {
            spaceId: 'space-id',
            distance: 1,
          }),
        ).toEqual(mockEntranceSpace);
        expect(findOneByIdSpy).toHaveBeenCalledWith('entrance-id');
        expect(mockedSpaceService.findOneById).toHaveBeenCalledWith('space-id');
        expect(mockedSpaceService.findAllByEntranceId).toHaveBeenCalledWith(
          'entrance-id',
        );
        expect(mockedEntranceSpaceService.create).toHaveBeenCalledWith(
          EntranceSpace.construct({
            entranceId: 'entrance-id',
            spaceId: 'space-id',
            distance: 1,
          }),
        );
      });
    });
  });

  describe('enter', () => {
    let countSpy: jest.SpyInstance;
    let findOneByIdSpy: jest.SpyInstance;
    let autoSelectAvailableSpaceByVehicleSizeSpy: jest.SpyInstance;

    describe('when there are less than 3 parking spaces', () => {
      beforeEach(() => {
        countSpy = jest.spyOn(service, 'count').mockResolvedValueOnce(2);
        findOneByIdSpy = jest.spyOn(service, 'findOneById');
        autoSelectAvailableSpaceByVehicleSizeSpy = jest.spyOn(
          service,
          'autoSelectAvailableSpaceByVehicleSize',
        );
      });

      it('throws MethodNotAllowedException', async () => {
        await expect(service.enter('entrance-id', mockVehicle)).rejects.toThrow(
          MethodNotAllowedException,
        );
        expect(countSpy).toHaveBeenCalled();

        expect(findOneByIdSpy).not.toHaveBeenCalled();
        expect(autoSelectAvailableSpaceByVehicleSizeSpy).not.toHaveBeenCalled();
        expect(mockedTicketService.getTicketForVehicle).not.toHaveBeenCalled();
        expect(mockedSpaceService.occupy).not.toHaveBeenCalled();
        expect(mockedTicketService.findOneById).not.toHaveBeenCalled();
      });
    });

    describe('when the entrance does not exists', () => {
      beforeEach(() => {
        countSpy = jest.spyOn(service, 'count').mockResolvedValueOnce(3);
        findOneByIdSpy = jest
          .spyOn(service, 'findOneById')
          .mockResolvedValueOnce(null);
        autoSelectAvailableSpaceByVehicleSizeSpy = jest.spyOn(
          service,
          'autoSelectAvailableSpaceByVehicleSize',
        );
      });

      it('throws NotFoundException', async () => {
        await expect(service.enter('entrance-id', mockVehicle)).rejects.toThrow(
          NotFoundException,
        );
        expect(countSpy).toHaveBeenCalled();
        expect(findOneByIdSpy).toHaveBeenCalledWith('entrance-id');

        expect(autoSelectAvailableSpaceByVehicleSizeSpy).not.toHaveBeenCalled();
        expect(mockedTicketService.getTicketForVehicle).not.toHaveBeenCalled();
        expect(mockedSpaceService.occupy).not.toHaveBeenCalled();
        expect(mockedTicketService.findOneById).not.toHaveBeenCalled();
      });
    });

    describe('when there is no available space to park', () => {
      beforeEach(() => {
        countSpy = jest.spyOn(service, 'count').mockResolvedValueOnce(3);
        findOneByIdSpy = jest
          .spyOn(service, 'findOneById')
          .mockResolvedValueOnce(mockEntrance);
        autoSelectAvailableSpaceByVehicleSizeSpy = jest
          .spyOn(service, 'autoSelectAvailableSpaceByVehicleSize')
          .mockResolvedValueOnce(null);
      });

      it('throws MethodNotAllowedException', async () => {
        await expect(service.enter('entrance-id', mockVehicle)).rejects.toThrow(
          MethodNotAllowedException,
        );
        expect(countSpy).toHaveBeenCalled();
        expect(findOneByIdSpy).toHaveBeenCalledWith('entrance-id');
        expect(autoSelectAvailableSpaceByVehicleSizeSpy).toHaveBeenCalledWith(
          mockEntrance,
          mockVehicle.size,
        );

        expect(mockedTicketService.getTicketForVehicle).not.toHaveBeenCalled();
        expect(mockedSpaceService.occupy).not.toHaveBeenCalled();
        expect(mockedTicketService.findOneById).not.toHaveBeenCalled();
      });
    });

    describe('when there is an available space to park', () => {
      const mockSpacesWithDistance = {
        ...mockSpace,
        distance: 1,
      } as SpaceWithDistance;
      const updatedTicket = Ticket.construct({
        id: 'updated-ticket',
      });

      beforeEach(() => {
        countSpy = jest.spyOn(service, 'count').mockResolvedValueOnce(3);
        findOneByIdSpy = jest
          .spyOn(service, 'findOneById')
          .mockResolvedValueOnce(mockEntrance);
        autoSelectAvailableSpaceByVehicleSizeSpy = jest
          .spyOn(service, 'autoSelectAvailableSpaceByVehicleSize')
          .mockResolvedValueOnce(mockSpacesWithDistance);
        mockedTicketService.getTicketForVehicle.mockResolvedValueOnce(
          mockTicket,
        );
        mockedTicketService.findOneById.mockResolvedValue(updatedTicket);
      });

      it('allows the vehicle to occupy the space', async () => {
        expect(await service.enter('entrance-id', mockVehicle)).toEqual(
          updatedTicket,
        );

        expect(countSpy).toHaveBeenCalled();
        expect(findOneByIdSpy).toHaveBeenCalledWith('entrance-id');
        expect(autoSelectAvailableSpaceByVehicleSizeSpy).toHaveBeenCalledWith(
          mockEntrance,
          mockVehicle.size,
        );
        expect(mockedTicketService.getTicketForVehicle).toHaveBeenCalledWith(
          mockVehicle,
        );
        expect(mockedSpaceService.occupy).toHaveBeenCalledWith(
          mockTicket.id,
          mockEntrance.id,
          mockSpacesWithDistance.id,
        );
        expect(mockedTicketService.findOneById).toHaveBeenCalledWith(
          mockTicket.id,
        );
      });
    });
  });

  describe('autoSelectAvailableSpaceByVehicleSize', () => {
    describe('when there are no available entrance spaces for the vehicle of size', () => {
      beforeEach(() => {
        mockedSpaceService.getAvailableEntranceSpacesForVehicleSize.mockResolvedValueOnce(
          [],
        );
      });

      it('returns undefined', async () => {
        expect(
          await service.autoSelectAvailableSpaceByVehicleSize(
            mockEntrance,
            VehicleSize.Small,
          ),
        ).toBeUndefined();
        expect(
          mockedSpaceService.getAvailableEntranceSpacesForVehicleSize,
        ).toHaveBeenCalledWith('entrance-id', VehicleSize.Small);
      });
    });

    describe('when there are available spaces', () => {
      const spaces: Space[] = [
        Space.construct({
          id: 'space-1',
          entranceSpaces: [
            EntranceSpace.construct({
              id: 'entrance-space-1',
              distance: 20,
            }),
          ],
        }),
        Space.construct({
          id: 'space-2',
          entranceSpaces: [
            EntranceSpace.construct({
              id: 'entrance-space-2',
              distance: 3,
            }),
          ],
        }),
        Space.construct({
          id: 'space-3',
          entranceSpaces: [
            EntranceSpace.construct({
              id: 'entrance-space-3',
              distance: 4,
            }),
          ],
        }),
      ];

      beforeEach(() => {
        mockedSpaceService.getAvailableEntranceSpacesForVehicleSize.mockResolvedValueOnce(
          spaces,
        );
      });

      it('returns the nearest space based on distance', async () => {
        expect(
          await service.autoSelectAvailableSpaceByVehicleSize(
            mockEntrance,
            VehicleSize.Small,
          ),
        ).toEqual(
          expect.objectContaining({
            id: 'space-2',
          }),
        );
        expect(
          mockedSpaceService.getAvailableEntranceSpacesForVehicleSize,
        ).toHaveBeenCalledWith('entrance-id', VehicleSize.Small);
      });
    });
  });

  describe('exit', () => {
    beforeEach(() => {
      mockedTicketService.checkOutVehicle.mockResolvedValueOnce(mockTicket);
    });

    it('returns the ticket of the exiting vehicle', async () => {
      expect(await service.exit(mockVehicle)).toEqual(mockTicket);
      expect(mockedTicketService.checkOutVehicle).toHaveBeenCalledWith(
        mockVehicle,
      );
    });
  });
});
