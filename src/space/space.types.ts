import { SizeDictionary } from 'src/utils/types';

export enum SpaceSize {
  Small = 'SMALL',
  Medium = 'MEDIUM',
  Large = 'LARGE',
}

export const SpaceSizeDictionary: SizeDictionary<SpaceSize> = {
  SMALL: 1,
  MEDIUM: 10,
  LARGE: 20,
};
