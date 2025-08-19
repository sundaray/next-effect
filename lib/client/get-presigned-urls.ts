import "client-only";
import { ToolSubmissionFormSchemaType } from "@/lib/schema";
import { hc } from "hono/client";
import type { ApiRoutes } from "@/app/api/[[...path]]/route";

const client = hc<ApiRoutes>(process.env.NEXT_PUBLIC_BASE_URL!);

export async function getPresignedUrls(data: ToolSubmissionFormSchemaType) {
  try {
    const response = await client.api.tools["presigned-url"].$post({
      form: { ...data, categories: JSON.stringify(data.categories) },
    });
  } catch (error) {}
}
