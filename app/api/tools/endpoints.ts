import { HttpApiEndpoint } from "@effect/platform";
import { Schema } from "effect";
import { ToolSubmissionApiSchema } from "@/lib/schema";

export const submitTool = HttpApiEndpoint.post("submitTool", "/submit")
  .setPayload(ToolSubmissionApiSchema)
  .addSuccess(Schema.Struct({ message: Schema.String }));
