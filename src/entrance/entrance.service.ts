import {
  BadRequestException,
  Inject,
  Injectable,
  MethodNotAllowedException,
  NotFoundException,
} from '@nestjs/common';
import { ActivityLog } from 'src/activity-log/entities/activity-log.entity';
import { BaseService } from 'src/base/base.service';
import { EntranceSpaceService } from 'src/entrance-space/entrance-space.service';
import { Space } from 'src/space/entities/space.entity';
import { SpaceService } from 'src/space/space.service';
import { Ticket } from 'src/ticket/entities/ticket.entity';
import { TicketService } from 'src/ticket/ticket.service';
import { Vehicle } from 'src/vehicle/entities/vehicle.entity';
import { VehicleSize } from 'src/vehicle/vehicle.types';
import { Repository } from 'typeorm';
import { EntranceSpace } from '../entrance-space/entities/entrance-space.entity';
import { AssignSpaceDto } from './dto/add-space.dto';
import { Entrance } from './entities/entrance.entity';

@Injectable()
export class EntranceService extends BaseService<Entrance> {
  constructor(
    @Inject(Entrance.name)
    private entranceRepository: Repository<Entrance>,
    private spaceService: SpaceService,
    private entranceSpaceService: EntranceSpaceService,
    private ticketService: TicketService,
  ) {
    super(entranceRepository);
  }

  async assignSpaceById(
    entranceId: string,
    { spaceId, distance }: AssignSpaceDto,
  ) {
    const entrance = await this.findOneById(entranceId);
    if (!entrance) {
      throw new NotFoundException('Entrance not found');
    }

    const space = await this.spaceService.findOneById(spaceId);
    if (!space) {
      throw new NotFoundException('Space not found');
    }

    const existingSpaces = await this.spaceService.findAllByEntranceId(
      entranceId,
    );
    if (existingSpaces.find(({ id }) => id === spaceId)) {
      throw new BadRequestException('Space already assigned to the entrance');
    }

    return await this.entranceSpaceService.create(
      EntranceSpace.construct({
        entranceId,
        spaceId,
        distance,
      }),
    );
  }

  async enter(
    entranceId: string,
    vehicle: Vehicle,
  ): Promise<{
    entrance: Entrance;
    space: Space;
    activityLog: ActivityLog;
    ticket: Ticket;
  }> {
    if ((await this.count()) < 3) {
      throw new MethodNotAllowedException('Parking closed');
    }

    const entrance = await this.findOneById(entranceId);
    if (!entrance) {
      throw new NotFoundException('Entrance not found');
    }

    const spaceToPark = await this.autoSelectAvailableSpaceByVehicleSize(
      entrance,
      vehicle.size,
    );

    if (!spaceToPark) {
      throw new MethodNotAllowedException(
        'No parking space available. Please try another entrance.',
      );
    }

    const ticket = await this.ticketService.getTicketForVehicle(vehicle);

    const activityLog = await this.spaceService.occupy(
      spaceToPark,
      entrance,
      vehicle,
      ticket,
    );

    return {
      entrance,
      activityLog,
      space: spaceToPark,
      ticket,
    };
  }

  async autoSelectAvailableSpaceByVehicleSize(
    entrance: Entrance,
    vehicleSize: VehicleSize,
  ): Promise<Space | undefined> {
    const availableSpaces =
      await this.spaceService.getAvailableEntranceSpacesForVehicleSize(
        entrance.id,
        vehicleSize,
      );

    return availableSpaces.sort((a, b) => b.distance - a.distance).pop();
  }
}
