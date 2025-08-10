import { Effect, Option } from "effect";
import { HttpClientRequest } from "@effect/platform";
import { ApiClientService } from "@/lib/services/apiClient-service";

type UploadFilesToS3Params = {
  homepageScreenshot: {
    file: File;
    uploadUrl: string;
  };
  logo: Option.Option<{
    file: File;
    uploadUrl: string;
  }>;
};

export function uploadFilesToS3(params: UploadFilesToS3Params) {
  const effectsToRun = [];

  const homepageScreenshotEffect = Effect.gen(function* () {
    const client = yield* ApiClientService;
    const request = HttpClientRequest.put(
      params.homepageScreenshot.uploadUrl
    ).pipe(HttpClientRequest.bodyFileWeb(params.homepageScreenshot.file));
    return yield* client.execute(request).pipe(Effect.asVoid);
  });

  effectsToRun.push(homepageScreenshotEffect);

  if (Option.isSome(params.logo)) {
    const logoData = params.logo.value;

    const logoEffect = Effect.gen(function* () {
      const client = yield* ApiClientService;
      const request = HttpClientRequest.put(logoData.uploadUrl).pipe(
        HttpClientRequest.bodyFileWeb(logoData.file)
      );
      return yield* client.execute(request).pipe(Effect.asVoid);
    });

    effectsToRun.push(logoEffect);
  }

  return Effect.all(effectsToRun, { concurrency: "unbounded" }).pipe(
    Effect.asVoid
  );
}
