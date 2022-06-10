import { Exclude } from 'class-transformer';
import { ActivityLog } from 'src/activity-log/entities/activity-log.entity';
import { BaseEntity } from 'src/base/base.entity';
import { EntranceSpace } from 'src/entrance-space/entities/entrance-space.entity';
import { ParkingSession } from 'src/parking-session/entities/parking-session.entity';
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
  @OneToMany(() => EntranceSpace, (entranceSpace) => entranceSpace.entrance)
  @JoinColumn()
  entranceSpaces!: EntranceSpace[];

  @OneToMany(() => ActivityLog, (activityLog) => activityLog.entrance)
  @JoinColumn()
  activityLogs!: ActivityLog[];

  @OneToMany(() => ParkingSession, (parkingSession) => parkingSession.entrance)
  @JoinColumn()
  parkingSessions!: ParkingSession[];
}
