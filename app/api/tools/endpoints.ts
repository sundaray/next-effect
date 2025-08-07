import { HttpApiEndpoint, HttpApiSchema, Multipart } from "@effect/platform";
import { Schema } from "effect";
import { ToolSubmissionFormSchema } from "@/lib/schema";

export const submitTool = HttpApiEndpoint.post("submitTool", "/submit")
  .setPayload(ToolSubmissionFormSchema)
  .addSuccess(Schema.Struct({ message: Schema.String }));
