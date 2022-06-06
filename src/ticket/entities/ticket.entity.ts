import { ActivityLog } from 'src/activity-log/entities/activity-log.entity';
import { BaseEntity } from 'src/base/base.entity';
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

  @OneToMany(() => ActivityLog, (activityLog) => activityLog.ticket)
  @JoinColumn()
  activityLogs: ActivityLog[];

  @Column({ type: 'float', default: 0 })
  cost?: number;

  @Column({ type: 'float', default: 0 })
  hours?: number;
}
