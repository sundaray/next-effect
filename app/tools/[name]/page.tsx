import { Icons } from "@/components/icons";
import { ToolBreadcrumb } from "@/components/tools/tool-breadcrumb";
import { ToolCategories } from "@/components/tools/tool-categories";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import type { Tool } from "@/db/schema";
import { createSafeHtml } from "@/lib/create-safe-html";
import { getToolBySlug } from "@/lib/get-tool-by-slug";
import {
  cn,
  ensureAbsoluteUrl,
  getWebPVariantUrl,
  unslugify,
} from "@/lib/utils";
import { notFound } from "next/navigation";

const getPricingPillStyles = (pricing: Tool["pricing"]) => {
  switch (pricing) {
    case "free":
      return "border-emerald-200 bg-emerald-200 text-emerald-900 rounded-full";
    case "freemium":
      return "border-sky-200 bg-sky-200 text-sky-900 rounded-full";
    case "paid":
      return "bg-purple-200 text-purple-900 rounded-full border-purple-200";
    default:
      return "border-neutral-200 bg-neutral-200 text-neutral-900 rounded-full";
  }
};

export default async function ToolDetailsPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const tool = await getToolBySlug(name);

  if (!tool) {
    notFound();
  }

  const safeDescriptionHtml = createSafeHtml(tool.description);

  // Generate the srcSet for WebP images
  const webpSrcSet = `
    ${getWebPVariantUrl(tool.showcaseImageUrl, "sm")} 640w,
    ${getWebPVariantUrl(tool.showcaseImageUrl, "md")} 768w,
    ${getWebPVariantUrl(tool.showcaseImageUrl, "lg")} 1024w,
    ${getWebPVariantUrl(tool.showcaseImageUrl, "xl")} 1280w
  `;

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-36">
      <ToolBreadcrumb toolName={unslugify(tool.name)} />
      <article className="space-y-10">
        {/* --- Header Section --- */}
        <header className="flex flex-col items-start justify-between gap-8 md:flex-row">
          {/* Main content: Logo, Name, Tagline, and Pills */}
          <div className="flex-grow space-y-4">
            <div className="flex items-center gap-4">
              {tool.logoUrl ? (
                <img
                  src={tool.logoUrl}
                  alt={`${tool.name} logo`}
                  width={48}
                  height={48}
                  loading="eager"
                  className="size-12 shrink-0 rounded-md object-contain"
                />
              ) : (
                <div className="flex size-12 items-center justify-center rounded-md border border-neutral-200 bg-white text-2xl font-medium text-neutral-700">
                  {tool.name.charAt(0).toUpperCase()}
                </div>
              )}
              <h1 className="text-4xl font-bold tracking-tight text-pretty text-neutral-900">
                {tool.name}
              </h1>
            </div>

            <p className="text-lg text-neutral-700">{tool.tagline}</p>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <Badge
                className={cn(
                  "text-sm font-medium capitalize",
                  getPricingPillStyles(tool.pricing),
                )}
              >
                {tool.pricing}
              </Badge>
            </div>
          </div>

          {/* Visit Website Button */}
          <a
            href={ensureAbsoluteUrl(tool.websiteUrl)}
            target="_blank"
            rel="noopener"
            className={cn(buttonVariants({ variant: "default", size: "sm" }))}
          >
            Visit Website
            <Icons.arrowUpRight className="size-4 text-neutral-500" />
          </a>
        </header>

        {/* --- Showcase Image Section --- */}
        <div className="relative aspect-[16/9] w-full rounded-md">
          <picture className="absolute inset-0 size-full">
            <source
              type="image/webp"
              srcSet={webpSrcSet}
              sizes="(min-width: 768px) 768px, 100vw"
            />
            <img
              src={getWebPVariantUrl(tool.showcaseImageUrl, "lg")}
              alt={`${tool.name} showcase image`}
              className="size-full rounded-md object-cover"
              width="1280"
              height="720"
              loading="eager"
            />
          </picture>
        </div>

        <div className="prose prose-neutral prose-ol:*:my-0 prose-ul:*:my-0">
          <div dangerouslySetInnerHTML={safeDescriptionHtml} />
        </div>
        {tool.categories && tool.categories.length > 0 && (
          <ToolCategories categories={tool.categories} />
        )}
      </article>
    </div>
  );
}
