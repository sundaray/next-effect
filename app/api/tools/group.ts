import { HttpApiGroup } from "@effect/platform";
import { submitTool } from "@/app/api/tools/endpoints";

export const toolsGroup = HttpApiGroup.make("tools")
  .add(submitTool)
  .prefix("/api/tools");
