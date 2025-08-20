import "server-only";

import { Effect } from "effect";
import { DatabaseService } from "@/lib/services/database-service";
import { serverRuntime } from "@/lib/server-runtime";
import { tools } from "@/db/schema";

export async function getCategories() {
  const program = Effect.gen(function* () {
    const dbService = yield* DatabaseService;

    const categoryGroups = yield* dbService.use((db) =>
      db.select({ categories: tools.categories }).from(tools)
    );

    const combinedCategories = categoryGroups.flatMap(
      (tool) => tool.categories
    );

    const uniqueCategories = [...new Set(combinedCategories)];

    return uniqueCategories;
  });

  return await serverRuntime.runPromise(program);
}
