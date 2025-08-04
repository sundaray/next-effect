import { HttpApiBuilder } from "@effect/platform";
import { toolsApi } from "@/app/api/tools/api";
import { Effect } from "effect";

export const submitToolHandler = HttpApiBuilder.handler(
  toolsApi,
  "tools",
  "submitTool",
  ({ request, payload }) =>
    Effect.gen(function* () {
      Effect.log("Form payload: ", payload);
      return { success: true };
    })
);
