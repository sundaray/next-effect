import { HttpApiBuilder } from "@effect/platform";
import { api } from "@/app/api/api";
import { Effect } from "effect";

export const submitToolHandler = HttpApiBuilder.handler(
  api,
  "tools",
  "submitTool",
  ({ request, payload }) =>
    Effect.gen(function* () {
      yield* Effect.log("Form payload", payload);
      return { message: "Payload received." };
    })
);
