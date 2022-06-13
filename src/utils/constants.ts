import { SpaceSize } from 'src/space/space.types';

export const FLAT_RATE = 40;
export const FLAT_RATE_HOURS = 3;
export const DAILY_RATE = 5000;

export const CONTINUOUS_RATE_MINS = 60;

export const hourlyRate: Record<SpaceSize, number> = {
  SMALL: 20,
  MEDIUM: 60,
  LARGE: 100,
};
