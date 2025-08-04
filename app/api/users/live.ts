import { Layer } from "effect";
import { HttpApiBuilder } from "@effect/platform";
import { usersApi } from "@/app/api/users/api";
import { getUsersHandler, getUserHandler } from "@/app/api/users/handlers";
import { UsersLoggerLive } from "@/app/api/users/middleware";

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
