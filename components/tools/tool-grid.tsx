"use client";

import { ToolCard } from "@/components/tools/tool-card";
import type { Tool } from "@/db/schema";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";

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
          className="my-12 text-center text-sm text-pretty text-neutral-700"
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
          "my-12 grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
        )}
      >
        {tools.map((tool) => (
          <ToolCard tool={tool} key={tool.id} />
        ))}
      </motion.div>
    </AnimatePresence>
  );
}
