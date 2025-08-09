import { Effect, Data } from "effect";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "@/db/schema";
import { DbClientService } from "@/lib/services/dbClient-service";

class DatabaseError extends Data.TaggedError("DatabaseError")<{
  cause: unknown;
}> {}

type DatabaseServiceImp = {
  use: <A>(
    f: (db: PostgresJsDatabase<typeof schema>) => Promise<A>
  ) => Effect.Effect<A, DatabaseError>;
};

export class DatabaseService extends Effect.Service<DatabaseService>()(
  "DatabaseService",
  {
    effect: Effect.gen(function* () {
      const db = yield* DbClientService;

      return {
        use: (f) =>
          Effect.tryPromise({
            try: () => f(db),
            catch: (error) => new DatabaseError({ cause: error }),
          }),
      } satisfies DatabaseServiceImp;
    }),
    dependencies: [DbClientService.Default],
  }
) {}
