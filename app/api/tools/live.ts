import { HttpApiBuilder } from "@effect/platform";
import { toolsApi } from "@/app/api/tools/api";
import { submitToolHandler } from "@/app/api/tools/handlers";
import { Layer } from "effect";

export const toolsGroupLive = HttpApiBuilder.group(
  toolsApi,
  "tools",
  (handlers) => handlers.handle("submitTool", submitToolHandler)
);

export const toolsApiLive = HttpApiBuilder.api(toolsApi).pipe(
  Layer.provide(toolsGroupLive)
);
