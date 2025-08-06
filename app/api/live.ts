import { HttpApiBuilder } from "@effect/platform";
import { Layer } from "effect";
import { api } from "@/app/api/api";
import { toolsGroupLive } from "@/app/api/tools/live";
import { usersGroupLive } from "@/app/api/users/live";

export const apiLive = HttpApiBuilder.api(api).pipe(
  Layer.provide(toolsGroupLive),
  Layer.provide(usersGroupLive)
);
