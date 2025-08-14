import { Effect, Queue } from "effect";

export interface WebPVariantCreationJob {
  readonly toolId: string;
  readonly showcaseImageKey: string;
}

export class WebPVariantCreationQueueService extends Effect.Service<WebPVariantCreationQueueService>()(
  "WebPVariantCreationQueueService",
  {
    scoped: Effect.gen(function* () {
      yield* Effect.logInfo("Creating WebPVariantCreationQueueService...");
      const queue = yield* Queue.bounded<WebPVariantCreationJob>(100);
      return queue;
    }),
  }
) {}
