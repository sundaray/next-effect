"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Tool } from "@/components/tool-card";
import { ToolCard } from "@/components/tool-card";
import { ToolSearch } from "@/components/tool-search";
import { ToolSort } from "@/components/tool-sort";
import { ToolFilter } from "@/components/tool-filter";
import { ActiveFilters } from "@/components/active-filters";

interface HomePageClientProps {
  initialTools: Tool[];
  allCategories: string[];
  categoryCounts: Record<string, number>;
  pricingCounts: Record<string, number>;
}

export function HomePageClient({
  initialTools,
  allCategories,
  categoryCounts,
  pricingCounts,
}: HomePageClientProps) {
  const [showFilters, setShowFilters] = useState(false);

  const tools = initialTools;

  return (
    <div>
      <div className="w-full h-100 overflow-hidden relative">
        <div
          className="
        w-full h-full
        grid gap-1
        grid-cols-[repeat(auto-fit,2.5rem)]
        auto-rows-[2.5rem]
        justify-center
        content-center
        mask-radial-from-0% mask-radial-to-80%
        mask-radial-at-center
      "
        >
          {Array.from({ length: 400 }, (_, i) => (
            <div key={i} className="size-10 bg-neutral-100 rounded" />
          ))}
        </div>
        <div className="text-center text-pretty mx-auto px-4 z-10 max-w-2xl absolute inset-0 flex flex-col items-center justify-center">
          <h1 className="text-4xl tracking-tight font-bold text-neutral-900">
            The Ultimate AI Apps Directory
          </h1>
          <p className="text-neutral-700 font-medium leading-relaxed mt-4">
            Explore AI applications across industries and use cases.{" "}
            <span className="text-sky-700 font-semibold">
              List your AI app for free,
            </span>{" "}
            get a backlink to boost your SEO and connect with your target
            audience.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4">
        {/* Search, Filter, and Sort Controls */}
        <ActiveFilters onClearAll={() => setShowFilters(false)} />
        <div className="my-8 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4">
          <div>
            <ToolSearch
              page="search"
              isFilterOpen={showFilters}
              onFilterClick={() => setShowFilters(!showFilters)}
            />
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0, y: 0 }}
                  animate={{ height: "auto", opacity: 1, y: 8 }}
                  exit={{ height: 0, opacity: 0, y: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                >
                  <ToolFilter
                    categories={allCategories}
                    categoryCounts={categoryCounts}
                    pricingCounts={pricingCounts}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <ToolSort />
        </div>
        {/* Tool Grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mt-12">
          {tools && tools.length > 0 ? (
            tools.map((tool) => <ToolCard key={tool.id} tool={tool} />)
          ) : (
            <p className="text-neutral-600 col-span-full text-center">
              No tools have been submitted yet. Be the first!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
