import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { BaseService } from 'src/base/base.service';
import { ParkingSession } from 'src/parking-session/entities/parking-session.entity';
import { ParkingSessionService } from 'src/parking-session/parking-session.service';
import { ParkingSessionStatus } from 'src/parking-session/parking-session.types';
import { VehicleSize } from 'src/vehicle/vehicle.types';
import { FindManyOptions, Repository } from 'typeorm';
import { Space } from './entities/space.entity';
import { SpaceSize } from './space.types';

@Injectable()
export class SpaceService extends BaseService<Space> {
  constructor(
    @Inject(Space.name)
    private spaceRepository: Repository<Space>,
    @Inject(forwardRef(() => ParkingSessionService))
    private parkingSessionService: ParkingSessionService,
  ) {
    super(spaceRepository);
  }

  /**
   * Retrieves all the spaces with their entrances
   * @param {FindManyOptions<Entrance>} options find many options
   * @returns {Promise<Space[]>} resulting spaces
   */
  findAll(options: FindManyOptions<Space> = {}) {
    return super.findAll({
      relations: [
        'entranceSpaces',
        'entranceSpaces.entrance',
        'parkingSessions',
        'parkingSessions.ticket',
      ],
      ...options,
    });
  }

  /**
   * Retrieves all spaces assigned to the entrance of id
   * @param {string} entranceId id of entrance to retrieve the spaces for
   * @returns {Promise<Space[]>} resulting space
   */
  async findAllByEntranceId(entranceId: string): Promise<Space[]> {
    return this.findAll({
      relations: ['entranceSpaces'],
      where: {
        entranceSpaces: {
          entranceId,
        },
      },
    });
  }

  /**
   * Checks if the vehcile size is allowed to park in a space of size
   * @param {VehicleSize} vehicleSize size of the vehicle to check
   * @param {SpaceSize} spaceSize size of the vehicle to check
   * @returns {boolean} returns true if the vehicle size can park on a space of size, false otherwise
   */
  isVehicleSizeOnSpaceSizeParkAllowed(
    vehicleSize: VehicleSize,
    spaceSize: SpaceSize,
  ): boolean {
    return vehicleSize <= spaceSize;
  }

  /**
   * Checks if a space is vacant, meaning if it does not have any active sessions
   * @param {string} id space to check
   * @returns {Promise<boolean>} true if vacant, false otherwise
   */
  async isVacant(id: string): Promise<boolean> {
    return !(await this.parkingSessionService.findOne({
      where: { spaceId: id, status: ParkingSessionStatus.Started },
    }));
  }

  /**
   * Checks if a space is occupied, meaning if the space has an active session
   * @param {string} id space to check
   * @returns {Promise<boolean>} true if occupied, false otherwise
   */
  async isOccupied(id: string): Promise<boolean> {
    return !(await this.isVacant(id));
  }

  /**
   * Sets the space as occupied
   * @param {string} ticketId ticket of the session
   * @param {string} entranceId entrance where the occupant came from
   * @param {string} spaceId space to occupy
   * @returns {Promise<ParkingSession>} resulting parking session
   */
  async occupy(
    ticketId: string,
    entranceId: string,
    spaceId: string,
  ): Promise<ParkingSession> {
    if (await this.isOccupied(spaceId)) {
      throw new BadRequestException(`Space ${spaceId} is already occupied`);
    }

    return await this.parkingSessionService.start(
      ticketId,
      entranceId,
      spaceId,
    );
    /**
     * @todo add a space.isVacant field and update to true on session start?
     */
  }

  /**
   * Retrieves all vacant spaces of the entrance that a vehicle of size can park to
   * @param {string} entranceId entrance to check vacant spaces for
   * @param {VehicleSize} vehicleSize vehicle size to check if allowed to park in the spaces
   * @returns {Promise<Space[]>} resulting spaces
   * @todo convert filtering to a query
   */
  async getAvailableEntranceSpacesForVehicleSize(
    entranceId: string,
    vehicleSize: VehicleSize,
  ): Promise<Space[]> {
    const spaces = await this.findAll({
      relations: ['parkingSessions', 'entranceSpaces'],
      where: {
        entranceSpaces: {
          entranceId,
        },
      },
    });

    return spaces
      .filter(({ size: spaceSize }) =>
        this.isVehicleSizeOnSpaceSizeParkAllowed(vehicleSize, spaceSize),
      )
      .filter(
        ({ parkingSessions }) =>
          !parkingSessions.find(
            ({ status }) => status === ParkingSessionStatus.Started,
          ),
      );
  }
}
