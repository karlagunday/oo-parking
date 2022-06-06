import { ActivityLog } from 'src/activity-log/entities/activity-log.entity';
import { BaseEntity } from 'src/base/base.entity';
import { Ticket } from 'src/ticket/entities/ticket.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { VehicleSize } from '../vehicle.types';

@Entity('vehicles')
export class Vehicle extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  plateNumber: string;

  @Column({ type: 'enum', enum: VehicleSize, default: VehicleSize.Small })
  size!: VehicleSize;

  @OneToMany(() => ActivityLog, (activityLog) => activityLog.vehicle)
  @JoinColumn()
  activityLogs: ActivityLog[];

  @ManyToOne(() => Ticket, (ticket) => ticket.vehicle)
  @JoinColumn()
  tickets!: Ticket[];
}
