import { BaseEntity } from 'src/base/base.entity';
import { Entrance } from 'src/entrance/entities/entrance.entity';
import { Space } from 'src/space/entities/space.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity('entrance_spaces')
@Unique(['spaceId', 'entranceId'])
export class EntranceSpace extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  spaceId!: string;

  @ManyToOne(() => Space, (space) => space.entranceSpaces, { eager: true })
  @JoinColumn()
  space!: Space;

  @Column({ type: 'uuid' })
  entranceId!: string;

  @ManyToOne(() => Entrance, (entrance) => entrance.entranceSpaces)
  @JoinColumn()
  entrance!: Entrance;

  @Column({ type: 'int' })
  distance!: number;
}
