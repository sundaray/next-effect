import "client-only";
import { ok, err, Result, ResultAsync, safeTry } from "neverthrow";
import { saveToolPayload } from "@/lib/schema";
import { InternalServerError, NetworkError } from "@/lib/client/errors";

type SaveToolErrors = InternalServerError | NetworkError;

export async function saveTool(
  params: saveToolPayload
): Promise<Result<void, SaveToolErrors>> {
  const result = await safeTry(async function* () {
    const response = yield* ResultAsync.fromPromise(
      fetch("/api/tools/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      }),
      (error) => {
        console.error("NetworkError: ", error);
        return new NetworkError(
          "Please check your internet connection and try again."
        );
      }
    );

    const data = yield* ResultAsync.fromPromise(response.json(), (error) => {
      console.error("InternalServerError", error);
      return new InternalServerError(
        "Tool submission failed due to a server error. Please try again."
      );
    });

    if (!response.ok) {
      return err(data as SaveToolErrors);
    }

    return ok(data as undefined);
  });

  return result;
}
