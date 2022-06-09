import { EntranceSpace } from 'src/entrance-space/entities/entrance-space.entity';
import { Space } from './entities/space.entity';

export enum SpaceSize {
  Small = 1,
  Medium = 10,
  Large = 20,
}

export interface SpaceWithDistance
  extends Space,
    Pick<EntranceSpace, 'distance'> {}

export type SpaceCalculationResult = {
  spaceId: string;
  entranceId: string;
  hours: number;
  cost: number;
};
