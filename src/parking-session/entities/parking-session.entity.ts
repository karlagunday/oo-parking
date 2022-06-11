import { BaseEntity } from 'src/base/base.entity';
import { Entrance } from 'src/entrance/entities/entrance.entity';
import { Space } from 'src/space/entities/space.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Ticket } from '../../ticket/entities/ticket.entity';
import { ParkingSessionStatus } from '../parking-session.types';

@Entity('parking_sessions')
export class ParkingSession extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  startedAt!: Date;

  @Column({
    type: 'timestamptz',
    nullable: true,
    default: null,
  })
  endedAt?: Date;

  @Column({ type: 'uuid' })
  ticketId!: string;

  @ManyToOne(() => Ticket, (ticket) => ticket.parkingSessions)
  @JoinColumn()
  ticket!: Ticket;

  @Column({ type: 'uuid' })
  entranceId!: string;

  @ManyToOne(() => Entrance, (entrance) => entrance.parkingSessions)
  @JoinColumn()
  entrance!: Entrance;

  @Column({ type: 'uuid' })
  spaceId!: string;

  @ManyToOne(() => Space, (space) => space.parkingSessions)
  @JoinColumn()
  space!: Space;

  @Column({ type: 'enum', enum: ParkingSessionStatus })
  status!: ParkingSessionStatus;

  @Column({ type: 'float', default: 0 })
  cost?: number;

  @Column({ type: 'float', default: 0 })
  totalHours?: number;

  @Column({ type: 'float', default: 0 })
  paidHours?: number;
}
