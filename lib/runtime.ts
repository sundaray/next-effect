import "server-only";

import { Layer, ManagedRuntime } from "effect";
import { ApiClientService } from "@/lib/services/api-client-service";

const ApiClientServiceLayer = ApiClientService.Default;

const AppLayer = Layer.mergeAll(ApiClientServiceLayer);

export const AppRuntime = ManagedRuntime.make(AppLayer);
