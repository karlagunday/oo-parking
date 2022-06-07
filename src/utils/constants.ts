import { SpaceSize } from 'src/space/space.types';

export const FLAT_RATE = 40;
export const FLAT_RATE_HOURS = 3;
export const DAILY_RATE = 5000;

export const CONTINUOUS_RATE_MINS = 60;

/**
 * @todo create sizes dictionary to better handle this?
 */
export const hourlyRate: Record<SpaceSize, number> = {
  '1': 20,
  '10': 60,
  '20': 100,
};
