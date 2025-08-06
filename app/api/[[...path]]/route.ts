import { Layer } from "effect";
import { HttpApiBuilder, HttpServer } from "@effect/platform";
import { apiLive } from "@/app/api/live";

const { handler } = HttpApiBuilder.toWebHandler(
  Layer.mergeAll(apiLive, HttpServer.layerContext)
);

const wrappedHandler = async (request: Request) => {
  console.log("Incoming request URL:", request.url);
  console.log("Incoming request pathname:", new URL(request.url).pathname);
  return handler(request);
};

export const GET = wrappedHandler;
export const POST = wrappedHandler;
export const DELETE = wrappedHandler;
