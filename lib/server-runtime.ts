import { Layer, ManagedRuntime } from "effect";
import { DatabaseService } from "@/lib/services/database-service";
import { DbClientService } from "@/lib/services/dbClient-service";

const DatabaseServiceLayer = DatabaseService.Default;
const DbClientServiceLayer = DbClientService.Default;

const AppLayer = Layer.mergeAll(DatabaseServiceLayer, DbClientServiceLayer);

export const serverRuntime = ManagedRuntime.make(AppLayer);
