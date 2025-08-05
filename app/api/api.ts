import { HttpApi, HttpApiBuilder } from "@effect/platform";
import { usersGroup } from "@/app/api/users/group";
import { toolsGroup } from "@/app/api/tools/group";
import { toolsGroupLive } from "@/app/api/tools/live";
import { usersGroupLive } from "@/app/api/users/live";
import { Layer } from "effect";

export const combinedApi = HttpApi.make("combinedApi")
  .add(usersGroup)
  .add(toolsGroup);

export const combinedApiLive = HttpApiBuilder.api(combinedApi).pipe(
  Layer.provide(toolsGroupLive),
  Layer.provide(usersGroupLive)
);
