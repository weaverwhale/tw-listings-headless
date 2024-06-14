import { capture, captureGeneric } from './posthog';
import { logger } from '../logger';

export function trackEvent(
  event: string,
  properties: { userId: string; shopId: string } & Record<string, any>,
  options: {
    skipPosthog?: boolean;
    log?: boolean;
  } = {
    skipPosthog: false,
    log: false,
  }
) {
  const { userId, shopId, ...rest } = properties;
  if (!options.skipPosthog) {
    capture(userId, shopId, event, rest);
  }
  // add other analytics providers here
  if (options.log) {
    logger.info(
      `[Event Tracker]: shopId=${shopId} userId=${userId} event=${event}: ${JSON.stringify(rest)}`
    );
  }
}

export function trackPosthogEvent(
  distinctId: string,
  event: string,
  properties?: Record<string, any>,
  options: {
    skipPosthog?: boolean;
    log?: boolean;
  } = {
    skipPosthog: false,
    log: false,
  }
) {
  if (!options.skipPosthog) {
    captureGeneric(distinctId, event, properties);
  }
  if (options.log) {
    logger.info(
      `[Event Tracker]: distinctId=${distinctId} event=${event}: ${JSON.stringify(properties)}`
    );
  }
  // add other analytics providers here
}
