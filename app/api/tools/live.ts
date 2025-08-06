import { HttpApiBuilder } from "@effect/platform";
import { Effect, Layer } from "effect";
import { api } from "@/app/api/api";

export const toolsGroupLive = HttpApiBuilder.group(api, "tools", (handlers) =>
  handlers.handle("submitTool", () =>
    Effect.gen(function* () {
      console.log("Tools endpoint hit!");
      return { message: "Tool endpoint working correctly." };
    })
  )
);
