"use client";

import { AnimatePresence, motion } from "motion/react";
import type { Tool } from "@/db/schema";
import { ToolCard } from "@/components/tool-card";

interface ToolGridProps {
  tools: Tool[];
}

export function ToolGrid({ tools }: ToolGridProps) {
  return (
    <AnimatePresence mode="wait">
      {tools.length > 0 ? (
        <motion.div
          key="tool-grid"
          layoutId="tool-grid-container"
          layout="position"
          transition={{ layout: { duration: 0.15 } }}
          className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 my-12 group-has-[[data-pending]]:animate-pulse"
        >
          {tools.map((tool) => (
            <ToolCard tool={tool} key={tool.id} />
          ))}
        </motion.div>
      ) : (
        <motion.p
          key="no-tools-message"
          layoutId="tool-grid-container"
          layout="position"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="text-neutral-700 col-span-full text-center"
        >
          No tools found matching your criteria.
        </motion.p>
      )}
    </AnimatePresence>
  );
}
