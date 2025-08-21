import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { InferSelectModel } from "drizzle-orm";
import type { tools } from "@/db/schema";

// This type is automatically inferred from your database schema to stay in sync.
export type Tool = InferSelectModel<typeof tools>;

interface ToolCardProps {
  tool: Tool;
}

// Helper to get styles for the pricing pills
const getPricingPillStyles = (pricing: Tool["pricing"]) => {
  switch (pricing) {
    case "free":
      return "border-emerald-200 bg-emerald-100 text-emerald-800";
    case "freemium":
      return "border-sky-200 bg-sky-100 text-sky-800";
    case "paid":
      return "bg-purple-100 text-purple-900 rounded-full border-purple-200";
    default:
      return "border-neutral-200 bg-neutral-100 text-neutral-800";
  }
};

// Helper to create a URL-friendly slug from the tool name
const createSlug = (name: string) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/[\s-]+/g, "-"); // Replace spaces and hyphens with a single hyphen
};

export function ToolCard({ tool }: ToolCardProps) {
  const primaryCategory = tool.categories[0];
  const slug = createSlug(tool.name);

  return (
    <article className="group relative flex h-full flex-col rounded-lg border border-neutral-200 bg-neutral-100 p-6 shadow-sm transition-all duration-200 ease-in-out hover:scale-102 hover:border-neutral-300 hover:shadow-lg">
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
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-white">
            <span className="text-xl font-semibold text-neutral-700">
              {tool.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-semibold text-neutral-900">
            {tool.name}
          </h3>
          <p className="truncate text-xs text-neutral-700">{tool.website}</p>
        </div>
      </div>

      {/* Description */}
      <p className="line-clamp-2 text-sm leading-relaxed text-neutral-600">
        {tool.tagline}
      </p>

      {/* Footer with Pills */}
      <div className="flex items-center justify-between gap-2 border-neutral-200 mt-4">
        {primaryCategory && (
          <Badge
            variant="secondary"
            className=" bg-white font-semibold text-neutral-700 rounded-full border-neutral-200"
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
