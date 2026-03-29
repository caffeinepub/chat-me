import type { backendInterface as BackendInterface } from "../backend.d";
import { createActorWithConfig } from "../config";

// No singleton caching -- always create a fresh actor to avoid stale/broken instances
export async function getActor(): Promise<BackendInterface> {
  const actor = await createActorWithConfig();
  return actor as unknown as BackendInterface;
}
