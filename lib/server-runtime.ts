import { Layer, ManagedRuntime } from "effect";
import { ApiClientService } from "@/lib/services/api-client-service";
import { DatabaseService } from "@/lib/services/database-service";

const ApiClientServiceLayer = ApiClientService.Default;
const DatabaseServiceLayer = DatabaseService.Default;

const ServerAppLayer = Layer.mergeAll(
  ApiClientServiceLayer,
  DatabaseServiceLayer
);

export const ServerAppRuntime = ManagedRuntime.make(ServerAppLayer);
