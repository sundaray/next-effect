import { HttpApi } from "@effect/platform";
import { usersGroup } from "@/app/api/users/group";
import { toolsGroup } from "@/app/api/tools/group";

export const api = HttpApi.make("api").add(usersGroup).add(toolsGroup);
