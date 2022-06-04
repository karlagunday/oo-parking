import { BaseEntity } from 'src/base/base.entity';
import { Entrance } from 'src/entrance/entities/entrance.entity';
import { Space } from 'src/space/entities/space.entity';
import { Vehicle } from 'src/vehicle/entities/vehicle.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ActivityLogType } from '../activity-log.types';

@Entity('activity_logs')
export class ActivityLog extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  entranceId!: string;

  @ManyToOne(() => Entrance, (entrance) => entrance.activityLogs)
  @JoinColumn()
  entrance!: Entrance;

  @Column({ type: 'uuid' })
  spaceId!: string;

  @ManyToOne(() => Space, (space) => space.activityLogs)
  @JoinColumn()
  space!: Space;

  @Column({ type: 'uuid' })
  vehicleId!: string;

  @ManyToOne(() => Vehicle, (vehicle) => vehicle.activityLogs)
  @JoinColumn()
  vehicle!: Vehicle;

  @Column({ type: 'enum', enum: ActivityLogType })
  type!: ActivityLogType;
}
