import "client-only";
import { Effect } from "effect";
import { ToolSubmissionFormSchemaType } from "@/lib/schema";
import { hc } from "hono/client";
import type { ApiRoutes } from "@/app/api/[[...path]]/route";
import {
  NetworkError,
  InternalServerError,
  ParseError,
  UserSessionNotFoundError,
} from "@/lib/client/errors";

const client = hc<ApiRoutes>(process.env.NEXT_PUBLIC_BASE_URL!);

type GetPresignedUrlsResponse = {
  logoKey?: string;
  logoUploadUrl?: string;
  showcaseImageUploadUrl: string;
  showcaseImageKey: string;
};

export async function getPresignedUrls(data: ToolSubmissionFormSchemaType) {
  console.log("Form data inside get presigned url function: ", data);

  try {
    const response = await client.api.tools["presigned-url"].$post({
      form: { ...data, categories: JSON.stringify(data.categories) },
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    }

    if (!response.ok) {
      const data = await response.json();
      console.log("Get presigned URL data: ", data);
    }
  } catch (error) {}
}
