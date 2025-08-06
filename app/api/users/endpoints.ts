import { HttpApiEndpoint, HttpApiError } from "@effect/platform";
import { Schema } from "effect";

const User = Schema.Struct({
  id: Schema.Number,
  name: Schema.String,
});

export const getUsers = HttpApiEndpoint.get("getUsers", "/").addSuccess(
  Schema.String
);

export const getUser = HttpApiEndpoint.get("getUser", "/:id")
  .setPath(Schema.Struct({ id: Schema.NumberFromString }))
  .addSuccess(User, { status: 200 })
  .addError(HttpApiError.NotFound);
