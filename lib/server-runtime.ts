import { Layer, ManagedRuntime } from "effect";
import { DatabaseService } from "@/lib/services/database-service";
import { DbClientService } from "@/lib/services/dbClient-service";
import { StorageService } from "@/lib/services/storage-service";

const DatabaseServiceLayer = DatabaseService.Default;
const DbClientServiceLayer = DbClientService.Default;
const StorageServiceLayer = StorageService.Default;

const AppLayer = Layer.mergeAll(
  DatabaseServiceLayer,
  DbClientServiceLayer,
  StorageServiceLayer
);

export const serverRuntime = ManagedRuntime.make(AppLayer);
