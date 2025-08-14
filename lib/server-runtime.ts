import { Effect, Layer, ManagedRuntime, Queue } from "effect";
import { DatabaseService } from "@/lib/services/database-service";
import { DbClientService } from "@/lib/services/dbClient-service";
import { StorageService } from "@/lib/services/storage-service";
import { WebPVariantCreationQueueService } from "./services/webp-variant-creation-queue-service";
import { tools } from "@/db/schema";
import { createShowcaseImageWebPVariants } from "@/lib/server/create-showcase-image-webp-variants";
import { eq } from "drizzle-orm";

const DatabaseServiceLayer = DatabaseService.Default;
const DbClientServiceLayer = DbClientService.Default;
const StorageServiceLayer = StorageService.Default;
const WebPVariantCreationQueueServiceLayer =
  WebPVariantCreationQueueService.Default;

const AllServicesLayer = Layer.mergeAll(
  DatabaseServiceLayer,
  DbClientServiceLayer,
  StorageServiceLayer,
  WebPVariantCreationQueueServiceLayer
);

const makeWebPVariantCreationWorker = Effect.gen(function* () {
  const queue = yield* WebPVariantCreationQueueService;
  const dbService = yield* DatabaseService;

  yield* Effect.forever(
    Effect.gen(function* () {
      // Queue.take(queue) will PAUSE this fiber indefinitely until a job
      // is put onto the queue by the /save endpoint.
      const job = yield* Queue.take(queue);

      yield* dbService.use((db) =>
        db
          .update(tools)
          .set({ webpVariantCreationStatus: "processing" })
          .where(eq(tools.id, job.toolId))
      );

      yield* Effect.match(
        createShowcaseImageWebPVariants(job.showcaseImageKey),
        {
          // Case 1: The image processing failed.
          onFailure: (error) =>
            Effect.gen(function* () {
              yield* Effect.logError(
                `Job failed for toolId: ${job.toolId}`,
                error
              );
              return yield* dbService.use((db) =>
                db
                  .update(tools)
                  .set({ webpVariantCreationStatus: "failed" })
                  .where(eq(tools.id, job.toolId))
              );
            }),

          // Case 2: The image processing succeeded.
          onSuccess: () =>
            Effect.gen(function* () {
              yield* Effect.logInfo(`Job completed for toolId: ${job.toolId}`);
              return yield* dbService.use((db) =>
                db
                  .update(tools)
                  .set({ webpVariantCreationStatus: "completed" })
                  .where(eq(tools.id, job.toolId))
              );
            }),
        }
      );
    })
  );
});

const WorkerLogicLayer = Layer.effectDiscard(makeWebPVariantCreationWorker);
const WorkerLayer = WorkerLogicLayer.pipe(Layer.provide(AllServicesLayer));

const AppLayer = Layer.mergeAll(AllServicesLayer, WorkerLayer);

export const serverRuntime = ManagedRuntime.make(AppLayer);
