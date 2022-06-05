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
import { Space } from 'src/space/entities/space.entity';
import { Exclude, Expose, Transform } from 'class-transformer';

@Entity('entrances')
export class Entrance extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Exclude()
  @OneToMany(() => EntranceSpace, (entranceSpace) => entranceSpace.entrance, {
    eager: true,
  })
  @JoinColumn()
  entranceSpaces!: EntranceSpace[];

  @OneToMany(() => ActivityLog, (activityLog) => activityLog.entrance)
  @JoinColumn()
  activityLogs!: ActivityLog[];

  @Expose()
  get spaces() {
    return this.entranceSpaces.map(({ space, distance }) => ({
      ...space,
      distance,
    }));
  }
}
