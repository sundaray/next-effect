import { Layer } from "effect";
import { HttpApiBuilder } from "@effect/platform";
import { usersApi } from "./api";
import { getUsersHandler, getUserHandler } from "./handlers";
import { UsersLoggerLive } from "./middleware";

export const usersGroupLive = HttpApiBuilder.group(
  usersApi,
  "users",
  (handlers) =>
    handlers
      .handle("getUsers", getUsersHandler)
      .handle("getUser", getUserHandler)
).pipe(Layer.provide(UsersLoggerLive));

export const usersApiLive = HttpApiBuilder.api(usersApi).pipe(
  Layer.provide(usersGroupLive)
);
