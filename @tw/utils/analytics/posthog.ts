import { PostHog } from "posthog-node";
import { getSecretFromManager } from "../secrets";

async function initializePosthogClient() {
  return new PostHog(await getSecretFromManager("posthog-api-key"), {
    host: "https://app.posthog.com",
    flushAt: 1,
    flushInterval: 0,
    disableGeoip: true,
  });
}

const eventQueue = [];
let clientInitialized = false;

let posthogClient: PostHog;
initializePosthogClient()
  .then((client) => {
    clientInitialized = true;
    posthogClient = client;
    while (eventQueue.length > 0) {
      const event = eventQueue.shift();
      posthogClient.capture(event);
    }
  })
  .catch((err) => {
    console.error("posthog client init error", err);
  });

export function capture(
  userId: string,
  shopId: string,
  event: string,
  properties: Record<string, any> = {}
) {
  const obj = {
    distinctId: userId,
    groups: {
      shop: shopId,
    },
    event,
    properties,
  };
  if (!clientInitialized) {
    eventQueue.push(obj);
    return;
  }
  posthogClient.capture(obj);
}

export function captureGeneric(
  distinctId: string,
  event: string,
  properties: Record<string, any> = {}
) {
  const obj = {
    distinctId,
    event,
    properties,
  };

  if (!clientInitialized) {
    eventQueue.push(obj);
    return;
  }
  posthogClient.capture(obj);
}
