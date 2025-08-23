import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { Tool } from "@/db/schema";
import { slugify } from "@/lib/utils";
import { motion } from "motion/react";

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

export function ToolCard({ tool }: { tool: Tool }) {
  const primaryCategory = tool.categories[0];
  const slug = slugify(tool.name);

  return (
    <article className="group relative flex h-full flex-col rounded-md border border-neutral-200 bg-white p-6 shadow-xs transition-all duration-200 ease-in-out hover:scale-102 hover:border-neutral-300 hover:shadow-lg">
      <Link
        href={`/tool/${slug}`}
        className="absolute inset-0 z-10"
        aria-label={`Learn more about ${tool.name}`}
      />

      {/* Card Header: Logo, Name, Tagline */}
      <div className="mb-4 flex items-start gap-4">
        {tool.logoUrl ? (
          <Image
            src={tool.logoUrl}
            alt={`${tool.name} logo`}
            width={48}
            height={48}
            className="size-12 rounded-xl object-cover"
          />
        ) : (
          <div className="flex size-12 shrink-0 items-center justify-center rounded-md border border-neutral-200 bg-white">
            <span className="text-xl font-semibold text-neutral-700">
              {tool.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold text-neutral-900">
            {tool.name}
          </h3>
          <p className="text-xs text-neutral-700">{tool.website}</p>
        </div>
      </div>

      {/* Description */}
      <p className="line-clamp-2 text-sm leading-relaxed text-neutral-700 mb-auto">
        {tool.tagline}
      </p>

      {/* Footer with Pills */}
      <div className="flex items-center justify-between gap-2 border-neutral-200 mt-4">
        {primaryCategory && (
          <Badge
            variant="secondary"
            className=" bg-neutral-100 font-semibold text-neutral-700 rounded-full border-neutral-200"
          >
            {primaryCategory}
          </Badge>
        )}
        <Badge
          className={cn(
            "font-medium capitalize",
            getPricingPillStyles(tool.pricing)
          )}
        >
          {tool.pricing}
        </Badge>
      </div>
    </article>
  );
}
