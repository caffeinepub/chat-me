import type { backendInterface as BackendInterface } from "../backend.d";
import { createActorWithConfig } from "../config";

let cachedActor: BackendInterface | null = null;
let actorCreatePromise: Promise<BackendInterface> | null = null;

// Wrap any promise with a timeout
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new Error(`Connection timeout after ${ms}ms`)),
        ms,
      ),
    ),
  ]);
}

export async function getActor(): Promise<BackendInterface> {
  if (cachedActor) return cachedActor;
  if (actorCreatePromise) return actorCreatePromise;
  actorCreatePromise = withTimeout(createActorWithConfig(), 15000)
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
      // Each individual call also has a 20s timeout
      return await withTimeout(fn(actor), 20000);
    } catch (e) {
      lastError = e;
      resetActor();
      if (attempt < maxAttempts - 1) {
        // Shorter initial delay (500ms) with moderate backoff
        await new Promise((r) => setTimeout(r, 500 * 1.8 ** attempt));
      }
    }
  }
  throw lastError;
}
