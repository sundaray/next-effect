"use client";

import { TagGroup, TagList, Tag, Label } from "react-aria-components";

export function ToolCategories({ categories }: { categories: string[] }) {
  return (
    <TagGroup className="flex flex-col sm:flex-row gap-2">
      <Label className=" text-neutral-900 font-medium">Categories:</Label>
      <TagList
        items={categories.map((category) => ({
          id: category,
          name: category,
        }))}
        className="flex flex-wrap gap-2"
      >
        {(item) => (
          <Tag className="cursor-pointer font-medium rounded-full bg-neutral-200 text-sm px-3 py-1 text-neutral-900 hover:bg-neutral-900 hover:text-neutral-200 transition-colors outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-sky-600 data-[focus-visible]:ring-offset-2">
            {item.name}
          </Tag>
        )}
      </TagList>
    </TagGroup>
  );
}
