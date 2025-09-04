import {
  ToolSubmissionFormSchema,
  ToolSubmissionFormSchemaType,
} from "@/lib/schema";
import { Effect, Schema } from "effect";

export function validateToolSubmissionFormData(
  data: ToolSubmissionFormSchemaType,
) {
  return Effect.gen(function* () {
    return yield* Schema.decodeUnknown(ToolSubmissionFormSchema)(data);
  });
}
