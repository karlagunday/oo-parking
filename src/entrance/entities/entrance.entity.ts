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

  @OneToMany(() => EntranceSpace, (entranceSpace) => entranceSpace.entrance)
  @JoinColumn()
  entranceSpaces!: EntranceSpace[];

  @OneToMany(() => ParkingSession, (parkingSession) => parkingSession.entrance)
  @JoinColumn()
  parkingSessions!: ParkingSession[];
}
