import { Exclude, Expose } from 'class-transformer';
import { ActivityLog } from 'src/activity-log/entities/activity-log.entity';
import { BaseEntity } from 'src/base/base.entity';
import { EntranceSpace } from 'src/entrance-space/entities/entrance-space.entity';
import { SpaceWithDistance } from 'src/space/space.types';
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
  get spaces(): SpaceWithDistance[] {
    /**
     * @todo fix types
     */
    return this.entranceSpaces.map(
      ({ space, distance }) =>
        ({
          ...space,
          distance,
        } as unknown as SpaceWithDistance),
    );
  }
}
