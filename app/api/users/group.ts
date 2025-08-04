import { HttpApiGroup, HttpApiMiddleware } from "@effect/platform";

import { getUsers } from "./endpoints";
import { getUser } from "./endpoints";

class UsersLogger extends HttpApiMiddleware.Tag<UsersLogger>()("UsersLogger") {}

export const usersGroup = HttpApiGroup.make("users")
  .add(getUsers)
  .add(getUser)
  .prefix("/api/users")
  .middleware(UsersLogger);

export { UsersLogger };
