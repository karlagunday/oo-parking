import { BaseEntity } from 'src/base/base.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { VehicleSize } from '../vehicle.types';

@Entity()
export class Vehicle extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  plateNumber: string;

  @Column({ type: 'enum', enum: VehicleSize, default: VehicleSize.Small })
  size!: VehicleSize;
}
