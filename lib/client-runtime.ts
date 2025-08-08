import { Layer, ManagedRuntime } from "effect";
import { ApiClientService } from "@/lib/services/apiClient-service";

const ApiClientServiceLayer = ApiClientService.Default;

const AppLayer = Layer.mergeAll(ApiClientServiceLayer);

export const clientRuntime = ManagedRuntime.make(AppLayer);
