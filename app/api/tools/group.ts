import { HttpApiGroup } from "@effect/platform";
import { submitTool } from "@/app/api/tools/endpoints";

export const toolsGroup = HttpApiGroup.make("tools")
  .prefix("/api/tools")
  .add(submitTool);
