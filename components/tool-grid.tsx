"use client";

import { motion, AnimatePresence } from "motion/react";
import type { Tool } from "@/db/schema";
import { ToolCard } from "@/components/tool-card";

interface ToolGridProps {
  tools: Tool[];
}

export function ToolGrid({ tools }: ToolGridProps) {
  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 my-12 group-has-[[data-pending]]:animate-pulse">
      <AnimatePresence mode="wait">
        {tools.length > 0 ? (
          tools.map((tool) => <ToolCard tool={tool} key={tool.id} />)
        ) : (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="text-neutral-700 col-span-full text-center"
          >
            No tools found matching your criteria.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
