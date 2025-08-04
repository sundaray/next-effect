import { Layer } from "effect";
import { HttpServer, HttpApiBuilder } from "@effect/platform";
import { usersApiLive } from "@/app/api/users/live";
import { toolsApiLive } from "@/app/api/tools/live";

const { handler } = HttpApiBuilder.toWebHandler(
  Layer.mergeAll(usersApiLive, toolsApiLive, HttpServer.layerContext)
);

export const GET = handler;
export const POST = handler;
export const DELETE = handler;
