import { Layer, ManagedRuntime } from "effect";
import { ApiClientService } from "@/lib/services/api-client-service";
import { DatabaseService } from "@/lib/services/database-service";

const ApiClientServiceLayer = ApiClientService.Default;
const DatabaseServiceLayer = DatabaseService.Default;

const AppLayer = Layer.mergeAll(ApiClientServiceLayer, DatabaseServiceLayer);

export const AppRuntime = ManagedRuntime.make(AppLayer);
