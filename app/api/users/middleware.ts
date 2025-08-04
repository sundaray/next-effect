import { Effect, Layer } from "effect";
import { UsersLogger } from "./group";

export const UsersLoggerLive = Layer.effect(
  UsersLogger,
  Effect.gen(function* () {
    yield* Effect.log("UsersLogger middleware initialized.");

    return Effect.gen(function* () {
      yield* Effect.log("Request coming to the users HTTP API group.");
    });
  })
);
