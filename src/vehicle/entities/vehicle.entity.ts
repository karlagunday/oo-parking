import { BaseEntity } from 'src/base/base.entity';
import { Ticket } from 'src/ticket/entities/ticket.entity';
import {
  Column,
  Entity,
  JoinColumn,
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

  @OneToMany(() => Ticket, (ticket) => ticket.vehicle)
  @JoinColumn()
  tickets!: Ticket[];
}
