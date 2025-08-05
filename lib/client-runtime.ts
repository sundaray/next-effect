import { Layer, ManagedRuntime } from "effect";
import { ApiClientService } from "@/lib/services/api-client-service";

const ApiClientServiceLayer = ApiClientService.Default;

const ClientAppLayer = Layer.mergeAll(ApiClientServiceLayer);

export const ClientAppRuntime = ManagedRuntime.make(ClientAppLayer);
