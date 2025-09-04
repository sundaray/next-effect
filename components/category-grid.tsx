"use client";

import { MyTag, MyTagGroup } from "@/components/ui/tag";
import { useCategoryFilters } from "@/hooks/use-category-filters";
import { cn, slugify } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";

interface CategoryGridProps {
  categories: Record<string, string[]>;
  search: string;
}

const gridVariants = {
  hidden: { opacity: 0, y: 4 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 4 },
};

export function CategoryGrid({ categories, search }: CategoryGridProps) {
  const { isPending } = useCategoryFilters();
  const hasCategories = Object.keys(categories).length > 0;

  if (!hasCategories) {
    return (
      <AnimatePresence initial={false} mode="wait">
        <motion.p
          key="no-categories-message"
          layoutId="category-container"
          layout="position"
          variants={gridVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="mt-12 text-center text-sm"
        >
          No categories found matching "{search}"
        </motion.p>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence initial={false} mode="wait">
      <motion.div
        key="category-grid"
        layoutId="category-container"
        layout="position"
        variants={gridVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ duration: 0.15, ease: "easeOut" }}
        className={cn("mt-12 space-y-12")}
      >
        {Object.entries(categories).map(([letter, cats]) => (
          <section key={letter} aria-labelledby={`category-letter-${letter}`}>
            <div className="flex items-center gap-4">
              <h2
                id={`category-letter-${letter}`}
                className="text-2xl font-bold text-neutral-900"
              >
                {letter}
              </h2>
              <div className="h-px flex-grow bg-neutral-200"></div>
            </div>
            <div className="mt-4">
              <MyTagGroup
                aria-labelledby={`category-letter-${letter}`}
                items={cats.map((category) => ({ id: category }))}
                listClassName="flex flex-wrap gap-3"
              >
                {(item) => (
                  <MyTag
                    href={`/?category=${slugify(item.id)}`}
                    isDisabled={isPending}
                    className="cursor-pointer transition-colors hover:bg-neutral-900 hover:text-neutral-200"
                  >
                    {item.id}
                  </MyTag>
                )}
              </MyTagGroup>
            </div>
          </section>
        ))}
      </motion.div>
    </AnimatePresence>
  );
}
