import { ok, err, Result, ResultAsync, safeTry } from "neverthrow";

type UploadFilesToS3Params = {
  homepageScreenshot: File;
  homepageScreenshotUploadUrl: string;
  logo?: File;
  logoUploadUrl?: string;
};

type FileUploadError = {
  _tag: string;
  message: string;
};

export async function uploadFilesToS3(
  params: UploadFilesToS3Params
): Promise<Result<void, FileUploadError>> {
  const result = await safeTry(async function* () {
    const uploadPromises: Promise<Response>[] = [];

    // 1. Prepare the homepage screenshot upload promise (mandatory)
    const screenshotUploadPromise = fetch(params.homepageScreenshotUploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": params.homepageScreenshot.type,
      },
      body: params.homepageScreenshot,
    });
    uploadPromises.push(screenshotUploadPromise);

    // 2. Prepare the logo upload promise (optional)
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

    // What this error is?
    // 3. Execute all uploads in parallel
    const responses = yield* ResultAsync.fromPromise(
      Promise.all(uploadPromises),
      (): FileUploadError => ({
        _tag: "FileUploadError",
        message: "Failed to upload files to s3. Please try again.",
      })
    );

    // 4. Check if all uploads were successful
    for (const response of responses) {
      if (!response.ok) {
        return err({
          _tag: "FileUploadError",
          message: "Failed to upload files to storage. Please try again.",
        } as FileUploadError);
      }
    }

    return ok(undefined);
  });

  return result;
}
