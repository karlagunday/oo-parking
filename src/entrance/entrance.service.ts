import {
  BadRequestException,
  Inject,
  Injectable,
  MethodNotAllowedException,
  NotFoundException,
} from '@nestjs/common';
import { ActivityLogService } from 'src/activity-log/activity-log.service';
import { BaseService } from 'src/base/base.service';
import { EntranceSpaceService } from 'src/entrance-space/entrance-space.service';
import { SpaceService } from 'src/space/space.service';
import { SpaceWithDistance } from 'src/space/space.types';
import { TicketService } from 'src/ticket/ticket.service';
import { Vehicle } from 'src/vehicle/entities/vehicle.entity';
import { VehicleSize } from 'src/vehicle/vehicle.types';
import { Repository } from 'typeorm';
import { EntranceSpace } from '../entrance-space/entities/entrance-space.entity';
import { AssignSpaceDto } from './dto/add-space.dto';
import { Entrance } from './entities/entrance.entity';
import { EntranceEntryResult } from './entrance.types';

@Injectable()
export class EntranceService extends BaseService<Entrance> {
  constructor(
    @Inject(Entrance.name)
    private entranceRepository: Repository<Entrance>,
    private spaceService: SpaceService,
    private entranceSpaceService: EntranceSpaceService,
    private ticketService: TicketService,
    private activityLogService: ActivityLogService,
  ) {
    super(entranceRepository);
  }

  /**
   * Assigns a space to the entrance of ID
   * @param {string} entranceId id of the entrance
   * @param {AssignSpaceDto} dto space assignment information
   * @returns {Promise<EntranceSpace>} resulting entrance space assignment
   * @todo Update response
   */
  async assignSpaceById(
    entranceId: string,
    { spaceId, distance }: AssignSpaceDto,
  ): Promise<EntranceSpace> {
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

  /**
   * Allows a vehicle to enter the entrance of ID, selects an available space for the vehicle,
   * issues a ticket and proceeds to park the vehicle
   * @param {string} entranceId entrace where the vehicle attempts to enter
   * @param {Vehicle} vehicle vehicle that attempts to enter
   * @returns {Promise<EntranceEntryResult>} vehicle entry information
   */
  async enter(
    entranceId: string,
    vehicle: Vehicle,
  ): Promise<EntranceEntryResult> {
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

  /**
   * Automatically selects an available parking space of an entrance for a vehicle of size
   * @param {Entrance} entrance entrance to check for spaces
   * @param {VehicleSize} vehicleSize size of the vehicle to select a space for
   * @returns {Promise<SpaceWithDistance | null>} selected entrance space for the vehicle size, or undefined when no space is available
   */
  async autoSelectAvailableSpaceByVehicleSize(
    entrance: Entrance,
    vehicleSize: VehicleSize,
  ): Promise<SpaceWithDistance | undefined> {
    const availableSpaces =
      await this.spaceService.getAvailableEntranceSpacesForVehicleSize(
        entrance.id,
        vehicleSize,
      );

    return availableSpaces.sort((a, b) => b.distance - a.distance).pop();
  }

  /**
   * Allows the vehicle to check out of the space and exit the entrance.
   * @param {Vehicle} vehicle vehicle to exit
   * @returns {Promise<TicketBreakdown>} parking cost summary
   */
  async exit(vehicle: Vehicle) {
    const { ticket, breakdown } = await this.ticketService.checkOutVehicle(
      vehicle,
    );
    const activityLogs = await this.activityLogService.getAllByTicketId(
      ticket.id,
    );

    return {
      ticket,
      breakdown,
      activityLogs,
    };
  }
}
