import { SizeDictionary } from 'src/utils/types';

export enum VehicleSize {
  Small = 'SMALL',
  Medium = 'MEDIUM',
  Large = 'LARGE',
}

export const VehicleSizeDictionary: SizeDictionary<VehicleSize> = {
  SMALL: 1,
  MEDIUM: 10,
  LARGE: 20,
};
