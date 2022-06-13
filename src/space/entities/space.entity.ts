import { Exclude } from 'class-transformer';
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
import { SpaceSize } from '../space.types';

@Entity('spaces')
export class Space extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ type: 'enum', enum: SpaceSize })
  size!: SpaceSize;

  @OneToMany(() => EntranceSpace, (entranceSpace) => entranceSpace.space)
  @JoinColumn()
  entranceSpaces!: EntranceSpace[];

  @OneToMany(() => ParkingSession, (parkingSession) => parkingSession.space)
  @JoinColumn()
  parkingSessions!: ParkingSession[];
}
