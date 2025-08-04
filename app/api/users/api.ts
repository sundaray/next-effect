import { HttpApi } from "@effect/platform";
import { usersGroup } from "./group";

export const usersApi = HttpApi.make("usersApi").add(usersGroup);
