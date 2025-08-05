import { HttpApiGroup, HttpApiMiddleware } from "@effect/platform";

import { getUsers } from "@/app/api/users/endpoints";
import { getUser } from "@/app/api/users/endpoints";

class UsersLogger extends HttpApiMiddleware.Tag<UsersLogger>()("UsersLogger") {}

export const usersGroup = HttpApiGroup.make("users")
  .add(getUsers)
  .add(getUser)
  .prefix("/api/users")
  .middleware(UsersLogger);

export { UsersLogger };
