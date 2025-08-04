import { HttpApi, HttpApiEndpoint } from "@effect/platform";
import { Schema } from "effect";
import { ToolSubmissionSchema } from "@/lib/schema";

export const submitTool = HttpApiEndpoint.post("submitTool", "/submit")
  .setPayload(ToolSubmissionSchema)
  .addSuccess(
    Schema.Struct({
      success: Schema.Boolean,
    })
  );
