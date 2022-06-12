import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { differenceInSeconds } from 'date-fns';
import { BaseService } from 'src/base/base.service';
import { EntranceService } from 'src/entrance/entrance.service';
import { SpaceService } from 'src/space/space.service';
import { Ticket } from 'src/ticket/entities/ticket.entity';
import {
  DAILY_RATE,
  FLAT_RATE,
  FLAT_RATE_HOURS,
  hourlyRate,
} from 'src/utils/constants';
import { FindOneOptions, Repository } from 'typeorm';
import { ParkingSession } from './entities/parking-session.entity';
import { ParkingSessionStatus } from './parking-session.types';

@Injectable()
export class ParkingSessionService extends BaseService<ParkingSession> {
  constructor(
    @Inject(ParkingSession.name)
    private parkingSessionRepository: Repository<ParkingSession>,
    @Inject(forwardRef(() => EntranceService))
    private entranceService: EntranceService,
    @Inject(forwardRef(() => SpaceService))
    private spaceService: SpaceService,
  ) {
    super(parkingSessionRepository);
  }

  /**
   * Retrieves a parking session of ticket id and status
   * @param {string} ticketId id of the ticket
   * @param {ParkingSessionStatus} status status of the session
   * @returns {Promise<ParkingSession>} resulting parking session
   */
  findOneByTicketIdAndStatus(
    ticketId: string,
    status: ParkingSessionStatus,
    { where, ...options }: FindOneOptions<ParkingSession> = {},
  ) {
    return this.findOne({
      where: { ticketId, status, ...where },
      ...options,
    });
  }

  /**
   * Gets the current active session of a ticket
   * @param {string} ticketId id of the ticket
   * @returns {Promise<ParkingSession>} resulting parking
   */
  getCurrentOfTicketId(
    ticketId: string,
    options: FindOneOptions<ParkingSession> = {},
  ) {
    return this.findOneByTicketIdAndStatus(
      ticketId,
      ParkingSessionStatus.Started,
      options,
    );
  }

  /**
   * Starts a parking session. This creates a new session of started status
   * for the provided ticket, entrance and space
   * @param {string} ticketId id of the ticket
   * @param {string} entranceId id of the entrance
   * @param {string} spaceId id of the space
   * @returns {Promise<ParkingSession>} created parking session
   */
  async start(ticketId: string, entranceId: string, spaceId: string) {
    const entrance = await this.entranceService.findOneById(entranceId);
    if (!entrance) {
      throw new NotFoundException(`Entrance ${entranceId} not found`);
    }

    const space = await this.spaceService.findOneById(spaceId);
    if (!space) {
      throw new NotFoundException(`Space ${spaceId} not found`);
    }

    const existing = await this.getCurrentOfTicketId(ticketId);
    if (existing) {
      throw new BadRequestException(
        'Cannot start a new session as ticket currently has an active one',
      );
    }

    return await this.create(
      ParkingSession.construct({
        ticketId,
        entranceId,
        spaceId,
        status: ParkingSessionStatus.Started,
      }),
    );
  }

  /**
   * Stops a parking session. This ends the ticket's active parking session
   * @param {Ticket} ticket ticket to end the session
   * @returns {Promise<ParkingSession>} ended parking session of the ticket
   */
  async stop(ticket: Ticket) {
    const now = new Date();
    const { cost, totalHours, hoursBeingPaid, parkingSession } =
      await this.calculateActiveSessionCostOfTicket(ticket, now);

    await this.update(parkingSession.id, {
      endedAt: now,
      cost,
      totalHours,
      paidHours: hoursBeingPaid,
      status: ParkingSessionStatus.Ended,
    });

    return await this.findOneById(parkingSession.id);
  }

  /**
   * Calculates the cost of ticket's current session
   * @param {Ticket} ticket ticket to calculate the cost for
   * @param {Date} sessionEndTime assumed datetime of when the session will end
   * @returns
   * @todo add return type
   */
  async calculateActiveSessionCostOfTicket(
    ticket: Ticket,
    sessionEndTime: Date,
  ) {
    const parkingSession = await this.getCurrentOfTicketId(ticket.id, {
      relations: ['space'],
    });

    if (!parkingSession) {
      throw new BadRequestException(
        `Ticket ${ticket.id} does not have an active session`,
      );
    }

    let cost = 0;

    /**
     * Get difference in seconds, manually convert to hours
     * then round to 4 decimal places
     * @todo move rounding to `utils`
     */
    const difference =
      differenceInSeconds(sessionEndTime, parkingSession.startedAt) / 60 / 60;
    const totalHours = Math.round((difference + Number.EPSILON) * 1000) / 1000;

    /**
     * Session will not be charged if the ticket's remaining hours
     * can still cover the current session's hours
     */
    if (ticket.remainingHours >= totalHours) {
      return {
        cost,
        totalHours,
        // even if the cost is 0, it is still paying for the total hours of the session
        hoursBeingPaid: totalHours,
        parkingSession,
      };
    }

    const roundedTotalHours = Math.ceil(ticket.actualHours + totalHours);
    const spaceHourlyRate = hourlyRate[parkingSession.space.size];
    const unpaidHours = totalHours - ticket.remainingHours;

    /**
     * @todo simplify even further?
     */
    if (roundedTotalHours >= 24) {
      const days = Math.floor(roundedTotalHours / 24);
      cost =
        days * DAILY_RATE +
        (roundedTotalHours - days * 24) * spaceHourlyRate -
        ticket.totalCost;
    } else {
      const roundedUnpaidHours = Math.ceil(unpaidHours);

      if (ticket.paidHours >= FLAT_RATE_HOURS) {
        cost = roundedUnpaidHours * spaceHourlyRate;
      } else {
        const excess =
          FLAT_RATE_HOURS < roundedUnpaidHours
            ? roundedUnpaidHours - FLAT_RATE_HOURS
            : 0;
        cost = excess * spaceHourlyRate + FLAT_RATE;
      }
    }

    return {
      cost,
      hoursBeingPaid: unpaidHours,
      totalHours,
      parkingSession,
    };
  }
}
