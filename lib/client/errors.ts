// A specific error for server-side validation failures.
// The `issues` array will contain field-specific error messages.
export class ParseError extends Error {
  readonly _tag = "ParseError" as const;
  constructor(
    readonly issues: { message: string; path: (string | number)[] }[]
  ) {
    super();
    this.name = "ParseError";
  }
}

// A generic error for all other server-side errors.
export class InternalServerError extends Error {
  readonly _tag = "InternalServerError" as const;
  constructor(message: string) {
    super(message);
    this.name = "InternalServerError";
  }
}

// An error for when the fetch request itself fails.
export class NetworkError extends Error {
  readonly _tag = "NetworkError" as const;
  constructor(message: string) {
    super(message);
    this.name = "NetworkError";
  }
}
