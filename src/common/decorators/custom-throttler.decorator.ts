import { Throttle } from '@nestjs/throttler';

/**
 *! Strict rate for auth, payments  [3 requests in 1 sec]
 */
export const StrictThrottler = () =>
  Throttle({
    default: {
      ttl: 1000,
      limit: 3,
    },
  });

/**
 *! Moderate rate for orders  [5 requests in 1 sec]
 */
export const ModerateThrottler = () =>
  Throttle({
    default: {
      ttl: 1000,
      limit: 5,
    },
  });

/**
 *! Relaxed rate for read operations in products, categories etc. [20 requests in 1 sec]
 */
export const RelaxedThrottler = () =>
  Throttle({
    default: {
      ttl: 1000,
      limit: 20,
    },
  });
