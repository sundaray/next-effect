import { HttpApiBuilder } from "@effect/platform";
import { toolsApi } from "@/app/api/tools/api";
import { submitToolHandler } from "@/app/api/tools/handlers";

export const toolsGroupLive = HttpApiBuilder.group(
  toolsApi,
  "tools",
  (handlers) => handlers.handle("submitTool", submitToolHandler)
);
