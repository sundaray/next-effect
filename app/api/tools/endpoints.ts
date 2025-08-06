import { HttpApiEndpoint } from "@effect/platform";
import { Schema } from "effect";
import { ToolSubmissionSchema } from "@/lib/schema";

const User = Schema.Struct({
  id: Schema.Number,
  name: Schema.String,
});

export const submitTool = HttpApiEndpoint.get("submitTool", "/submit")
  // .setPayload(ToolSubmissionSchema)
  .addSuccess(Schema.Struct({ message: Schema.String }));
