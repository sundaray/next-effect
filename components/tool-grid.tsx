"use client";

import { AnimatePresence, motion } from "motion/react";
import type { Tool } from "@/db/schema";
import { ToolCard } from "@/components/tool-card";

interface ToolGridProps {
  tools: Tool[];
}

const gridVariants = {
  hidden: { opacity: 0, y: 4 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 4 },
};

export function ToolGrid({ tools }: ToolGridProps) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      {tools.length > 0 ? (
        <motion.div
          key="tool-grid"
          layout="position"
          layoutId="tool-grid-container"
          variants={gridVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 my-12 group-has-[[data-pending]]:animate-pulse"
        >
          {tools.map((tool) => (
            <ToolCard tool={tool} key={tool.id} />
          ))}
        </motion.div>
      ) : (
        <motion.p
          key="no-tools-message"
          layout="position"
          layoutId="tool-grid-container"
          variants={gridVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="text-neutral-700 col-span-full text-center my-12"
        >
          No tools found matching your criteria.
        </motion.p>
      )}
    </AnimatePresence>
  );
}
