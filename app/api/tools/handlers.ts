import { HttpApiBuilder } from "@effect/platform";
import { toolsApi } from "@/app/api/tools/api";
import { Effect } from "effect";

export const submitToolHandler = HttpApiBuilder.handler(
  toolsApi,
  "tools",
  "submitTool",
  ({ request }) =>
    Effect.gen(function* () {
      Effect.log("Http Server Request: ", request);
      return { success: true };
    })
);
