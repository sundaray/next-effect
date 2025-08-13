export class InternalServerError extends Error {
  readonly _tag = "InternalServerError" as const;
  constructor(message: string) {
    super(message);
    this.name = "InternalServerError";
  }
}

export class NetworkError extends Error {
  readonly _tag = "NetworkError" as const;
  constructor(message: string) {
    super(message);
    this.name = "NetworkError";
  }
}

export class ResponseBodyParseError extends Error {
  readonly _tag = "ResponseBodyParseError" as const;
  constructor(message: string) {
    super(message);
    this.name = "ResponseBodyParseError";
  }
}
