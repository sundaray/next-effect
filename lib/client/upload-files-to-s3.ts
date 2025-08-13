import "client-only";
import { ok, err, Result, ResultAsync, safeTry } from "neverthrow";
import { NetworkError, InternalServerError } from "@/lib/client/errors";

type UploadFilesToS3Params = {
  homepageScreenshot: File;
  homepageScreenshotUploadUrl: string;
  logo?: File;
  logoUploadUrl?: string;
};

type UploadFilesToS3Errors = NetworkError | InternalServerError;

export async function uploadFilesToS3(
  params: UploadFilesToS3Params
): Promise<Result<void, UploadFilesToS3Errors>> {
  const result = await safeTry(async function* () {
    const uploadPromises: Promise<Response>[] = [];

    // 1. Prepare the homepage screenshot upload promise
    const screenshotUploadPromise = fetch(params.homepageScreenshotUploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": params.homepageScreenshot.type,
      },
      body: params.homepageScreenshot,
    });
    uploadPromises.push(screenshotUploadPromise);

    // 2. Prepare the logo upload promise
    if (params.logoUploadUrl && params.logo) {
      const logoUploadPromise = fetch(params.logoUploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": params.logo.type,
        },
        body: params.logo,
      });
      uploadPromises.push(logoUploadPromise);
    }

    // 3. Execute all uploads in parallel
    const responses = yield* ResultAsync.fromPromise(
      Promise.all(uploadPromises),
      (error) => {
        console.error("NetworkError: ", error);
        return new NetworkError(
          "Please check your internet connection and try again."
        );
      }
    );

    // 4. Check if all uploads were successful
    for (const response of responses) {
      if (!response.ok) {
        console.error("InternalServerError: ", {
          status: response.status,
          statusText: response.statusText,
        });
        return err(
          new InternalServerError(
            "Tool submission failed due to a server error. Please try again."
          )
        );
      }
    }

    return ok(undefined);
  });

  return result;
}
