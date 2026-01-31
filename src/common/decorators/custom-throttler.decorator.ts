import { Throttle } from '@nestjs/throttler';

/**
 *! Strict rate for auth, payments
 */
export const StrictThrottler = () =>
  Throttle({
    default: {
      ttl: 1000,
      limit: 3,
    },
  });

/**
 *! Moderate rate for orders
 */
export const ModerateThrottler = () =>
  Throttle({
    default: {
      ttl: 1000,
      limit: 5,
    },
  });

/**
 *! Relaxed rate for read operations in products, categories etc
 */
export const RelaxedThrottler = () =>
  Throttle({
    default: {
      ttl: 1000,
      limit: 20,
    },
  });
