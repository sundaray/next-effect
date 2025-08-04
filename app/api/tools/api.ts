import { HttpApi } from "@effect/platform";
import { toolsGroup } from "@/app/api/tools/group";

export const toolsApi = HttpApi.make("toolsApi").add(toolsGroup);
