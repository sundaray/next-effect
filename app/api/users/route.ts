import { Layer } from "effect";
import { HttpServer, HttpApiBuilder } from "@effect/platform";
import { usersApiLive } from "@/app/api/users/live";

const { handler } = HttpApiBuilder.toWebHandler(
  Layer.mergeAll(usersApiLive, HttpServer.layerContext)
);

export const GET = handler;
