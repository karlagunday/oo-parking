import { ActivityLog } from 'src/activity-log/entities/activity-log.entity';
import { BaseEntity } from 'src/base/base.entity';
import { EntranceSpace } from 'src/entrance-space/entities/entrance-space.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SpaceSize } from '../space.types';

@Entity('spaces')
export class Space extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ type: 'enum', enum: SpaceSize })
  size!: string;

  @OneToMany(() => EntranceSpace, (entranceSpace) => entranceSpace.space)
  @JoinColumn()
  entranceSpaces!: EntranceSpace[];

  @OneToMany(() => ActivityLog, (activityLog) => activityLog.space)
  @JoinColumn()
  activityLogs!: ActivityLog[];
}
