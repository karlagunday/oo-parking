import { BaseEntity } from 'src/base/base.entity';
import { ParkingSession } from 'src/parking-session/entities/parking-session.entity';
import { Vehicle } from 'src/vehicle/entities/vehicle.entity';
import {
  Column,
  Entity,
  Generated,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TicketStatus } from '../ticket.types';

@Entity('tickets')
export class Ticket extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  @Generated('increment')
  number!: number;

  @Column({ type: 'enum', enum: TicketStatus })
  status!: TicketStatus;

  @Column({ type: 'uuid' })
  vehicleId!: string;

  @ManyToOne(() => Vehicle, (vehicle) => vehicle.tickets)
  @JoinColumn()
  vehicle!: Vehicle;

  @Column({
    type: 'timestamptz',
    nullable: true,
    default: null,
  })
  completedAt?: Date;

  @OneToMany(() => ParkingSession, (parkingSession) => parkingSession.ticket)
  @JoinColumn()
  parkingSessions: ParkingSession[];

  @Column({ type: 'float', default: 0 })
  totalCost?: number;

  @Column({ type: 'float', default: 0 })
  actualHours?: number;

  @Column({ type: 'float', default: 0 })
  paidHours?: number;

  @Column({ type: 'float', default: 0 })
  remainingHours?: number;
}
