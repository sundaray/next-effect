"use client";

import { MyTagGroup, MyTag } from "@/components/ui/tag";
import { slugify } from "@/lib/utils";

export function ToolCategories({ categories }: { categories: string[] }) {
  return (
    <MyTagGroup
      label="Categories:"
      items={categories.map((category) => ({ id: category, name: category }))}
      className="flex flex-col gap-3 sm:flex-row sm:items-center"
    >
      {(item) => (
        <MyTag
          id={item.id}
          href={`/?category=${slugify(item.id)}`}
          className="cursor-pointer hover:bg-neutral-900 hover:text-neutral-200 transition-colors"
        >
          {item.name}
        </MyTag>
      )}
    </MyTagGroup>
  );
}
