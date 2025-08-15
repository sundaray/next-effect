import { Data } from "effect";

export class NetworkError extends Data.TaggedError("NetworkError")<{
  message: string;
}> {}

export class InternalServerError extends Data.TaggedError(
  "InternalServerError"
)<{
  message: string;
}> {}

export class ParseError extends Data.TaggedError("ParseError")<{
  issues: { _tag: string; path: string[]; message: string }[];
}> {}

export class UserSessionError extends Data.TaggedError("UserSessionError")<{
  message: string;
}> {}
