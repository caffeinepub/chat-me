import type { backendInterface as BackendInterface } from "../backend.d";
import { createActorWithConfig } from "../config";

let cachedActor: BackendInterface | null = null;
let actorCreatePromise: Promise<BackendInterface> | null = null;

export async function getActor(): Promise<BackendInterface> {
  if (cachedActor) return cachedActor;
  if (actorCreatePromise) return actorCreatePromise;
  actorCreatePromise = createActorWithConfig()
    .then((a) => {
      cachedActor = a as unknown as BackendInterface;
      actorCreatePromise = null;
      return cachedActor;
    })
    .catch((e) => {
      actorCreatePromise = null;
      throw e;
    });
  return actorCreatePromise;
}

export function resetActor() {
  cachedActor = null;
  actorCreatePromise = null;
}

export async function withRetry<T>(
  fn: (actor: BackendInterface) => Promise<T>,
  maxAttempts = 4,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const actor = await getActor();
      return await fn(actor);
    } catch (e) {
      lastError = e;
      resetActor();
      if (attempt < maxAttempts - 1) {
        await new Promise((r) => setTimeout(r, 800 * 2 ** attempt));
      }
    }
  }
  throw lastError;
}
