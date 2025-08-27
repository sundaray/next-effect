"use client";

import { MyTagGroup, MyTag } from "@/components/ui/tag";

export function ToolCategories({ categories }: { categories: string[] }) {
  return (
    <MyTagGroup
      label="Categories:"
      items={categories.map((category) => ({ id: category, name: category }))}
      className="flex flex-col gap-2 sm:flex-row"
    >
      {(item) => <MyTag id={item.id}>{item.name}</MyTag>}
    </MyTagGroup>
  );
}
