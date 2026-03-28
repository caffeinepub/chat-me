import type { backendInterface as BackendInterface } from "../backend.d";
import { createActorWithConfig } from "../config";

let actorInstance: BackendInterface | null = null;

export async function getActor(): Promise<BackendInterface> {
  if (!actorInstance) {
    const actor = await createActorWithConfig();
    actorInstance = actor as unknown as BackendInterface;
  }
  return actorInstance;
}
