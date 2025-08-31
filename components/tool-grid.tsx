"use client";

import { AnimatePresence, motion } from "motion/react";
import type { Tool } from "@/db/schema";
import { ToolCard } from "@/components/tool-card";
import { cn } from "@/lib/utils";

interface ToolGridProps {
  tools: Tool[];
  isFiltered: boolean;
}

const gridVariants = {
  hidden: { opacity: 0, y: 4 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 4 },
};

export function ToolGrid({ tools, isFiltered }: ToolGridProps) {
  const hasTools = tools.length > 0;

  if (!hasTools) {
    return (
      <AnimatePresence initial={false} mode="wait">
        <motion.p
          key="no-tools-message"
          layoutId="tool-grid-container"
          layout="position"
          variants={gridVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="text-neutral-700 text-sm text-center my-12 text-pretty"
        >
          {isFiltered
            ? "No apps found matching your filter criteria."
            : "No apps have been approved yet. Check back soon!"}
        </motion.p>
      </AnimatePresence>
    );
  }
  return (
    <AnimatePresence initial={false} mode="wait">
      <motion.div
        key="tool-grid"
        layoutId="tool-grid-container"
        layout="position"
        variants={gridVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ duration: 0.15, ease: "easeOut" }}
        className={cn(
          "grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 my-12"
        )}
      >
        {tools.map((tool) => (
          <ToolCard tool={tool} key={tool.id} />
        ))}
      </motion.div>
    </AnimatePresence>
  );
}
