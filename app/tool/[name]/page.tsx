// app/tool/[slug]/page.tsx

import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getToolBySlug } from "@/lib/get-tool-by-slug";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid";
import type { Metadata } from "next";
import type { Tool } from "@/db/schema";

// This helper function ensures consistent styling for the pricing pill.
const getPricingPillStyles = (pricing: Tool["pricing"]) => {
  switch (pricing) {
    case "free":
      return "border-emerald-200 bg-emerald-100 text-emerald-900 rounded-full";
    case "freemium":
      return "border-sky-200 bg-sky-100 text-sky-900 rounded-full";
    case "paid":
      return "bg-purple-100 text-purple-900 rounded-full border-purple-200";
    default:
      return "border-neutral-200 bg-neutral-100 text-neutral-900 rounded-full";
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

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16">
      <article className="space-y-10">
        {/* --- Header Section --- */}
        <header className="flex flex-col md:flex-row justify-between items-start gap-8">
          {/* Main content: Logo, Name, Tagline, and Pills */}
          <div className="flex-grow space-y-4">
            <div className="flex items-center gap-4">
              {/* {tool.logoUrl ? (
                <image
                  src={tool.logoUrl}
                  alt={`${tool.name} logo`}
                  width={64}
                  height={64}
                  className="size-16 rounded-xl object-cover border border-neutral-200"
                />
              ) : (
                <div className="flex size-16 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-white">
                  <span className="text-3xl font-semibold text-neutral-700">
                    {tool.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )} */}
              <h1 className="text-4xl font-bold tracking-tight text-neutral-900">
                {tool.name}
              </h1>
            </div>

            <p className="text-lg text-neutral-700 max-w-2xl">{tool.tagline}</p>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <Badge
                className={cn(
                  "font-medium capitalize",
                  getPricingPillStyles(tool.pricing)
                )}
              >
                {tool.pricing}
              </Badge>
              {tool.categories.map((category) => (
                <Badge
                  key={category}
                  variant="secondary"
                  className="text-neutral-900 rounded-full border-neutral-200"
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>

          {/* Call-to-action Button */}
          <Button asChild className="shrink-0 w-full md:w-auto">
            <Link href={tool.website} target="_blank" rel="noopener noreferrer">
              Visit Website
              <ArrowTopRightOnSquareIcon className="ml-2 size-4" />
            </Link>
          </Button>
        </header>

        {/* --- Showcase Image Section --- */}
        <div className="relative w-full aspect-video overflow-hidden rounded-lg border border-neutral-300 shadow-md">
          <image
            src={tool.showcaseImageUrl}
            alt={`${tool.name} showcase image`}
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* --- Description Section --- */}
        <div className="prose prose-neutral max-w-none">
          <div dangerouslySetInnerHTML={{ __html: tool.description }} />
        </div>
      </article>
    </div>
  );
}
