import { Badge } from "@/components/ui/badge";
import type { Tool } from "@/db/schema";
import { cn } from "@/lib/utils";
import Link from "next/link";

const getPricingPillStyles = (pricing: Tool["pricing"]) => {
  switch (pricing) {
    case "free":
      return "border-emerald-200 bg-emerald-200 text-emerald-900 rounded-full";
    case "freemium":
      return "border-sky-200 bg-sky-200 text-sky-900 rounded-full";
    case "paid":
      return "bg-purple-200 text-purple-900 rounded-full border-purple-200";
    default:
      return "border-neutral-200 bg-neutral-100 text-neutral-900 rounded-full";
  }
};

export function ToolCard({ tool }: { tool: Tool }) {
  const primaryCategory = tool.categories[0];

  return (
    <article className="group relative flex h-full flex-col rounded-md border border-neutral-300 p-4 shadow-xs transition-all group-has-[[data-pending]]:pointer-events-none group-has-[[data-pending]]:opacity-50 hover:scale-102 hover:shadow-lg">
      <Link
        href={`/tools/${tool.slug}`}
        className="absolute inset-0 z-10"
        aria-label={`Learn more about ${tool.name}`}
      />

      {/* Card Header: Logo, Name, Tagline */}
      <div className="mb-4 flex items-start gap-4">
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

        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-bold tracking-tight text-neutral-900">
            {tool.name}
          </h3>
          <p className="text-sm text-neutral-700">{tool.websiteUrl}</p>
        </div>
      </div>

      {/* Description */}
      <p className="mb-auto line-clamp-3 text-sm/6 text-neutral-700">
        {tool.tagline}
      </p>

      {/* Footer with Pills */}
      <div className="mt-4 flex items-center justify-between gap-2 border-neutral-200">
        {primaryCategory && (
          <Badge className="rounded-full border-neutral-200 bg-neutral-200 text-neutral-900">
            {primaryCategory}
          </Badge>
        )}
        <Badge
          className={cn(
            "font-medium capitalize",
            getPricingPillStyles(tool.pricing),
          )}
        >
          {tool.pricing}
        </Badge>
      </div>
    </article>
  );
}
