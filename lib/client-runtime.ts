// import { ApiClientService } from "@/lib/services/apiClient-service";
// import { Layer, ManagedRuntime } from "effect";

// const ApiClientServiceLayer = ApiClientService.Default;

// const AppLayer = Layer.mergeAll(ApiClientServiceLayer);

// export const clientRuntime = ManagedRuntime.make(AppLayer);

import { FetchHttpClient } from "@effect/platform";
import { ManagedRuntime } from "effect";

const AppLayer = FetchHttpClient.layer;

export const clientRuntime = ManagedRuntime.make(AppLayer);
