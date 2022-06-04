import { BaseEntity } from 'src/base/base.entity';
import { ActivityLog } from 'src/activity-log/entities/activity-log.entity';
import { EntranceSpace } from 'src/entrance-space/entities/entrance-space.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('entrances')
export class Entrance extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @OneToMany(() => EntranceSpace, (entranceSpace) => entranceSpace.entrance)
  @JoinColumn()
  entranceSpaces!: EntranceSpace[];

  @OneToMany(() => ActivityLog, (activityLog) => activityLog.entrance)
  @JoinColumn()
  activityLogs!: ActivityLog[];
}
