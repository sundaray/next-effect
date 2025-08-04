import { HttpApi } from "@effect/platform";
import { usersGroup } from "@/app/api/users/group";
import { toolsGroup } from "@/app/api/tools/group";

export const combinedApi = HttpApi.make("combinedApi")
  .add(usersGroup)
  .add(toolsGroup);
