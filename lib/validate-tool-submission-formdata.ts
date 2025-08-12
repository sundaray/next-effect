import { Effect, Schema } from "effect";
import {
  ToolSubmissionFormSchema,
  ToolSubmissionFormSchemaType,
} from "@/lib/schema";

export function validateToolSubmissionFormData(
  parsedBody: ToolSubmissionFormSchemaType
) {
  return Effect.gen(function* () {
    return yield* Schema.decodeUnknown(ToolSubmissionFormSchema)(parsedBody);
  });
}
