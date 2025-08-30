"use client";

import type {
  TagGroupProps,
  TagListProps,
  TagProps,
} from "react-aria-components";
import {
  TagGroup,
  TagList,
  Tag,
  Label,
  Button,
  Text,
} from "react-aria-components";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";

type MyTagProps = Omit<TagProps, "children"> & {
  children?: React.ReactNode;
  className?: string;
  ref?: React.Ref<HTMLDivElement>;
};

function MyTag({ children, className, ref, ...props }: MyTagProps) {
  const textValue = typeof children === "string" ? children : undefined;

  return (
    <Tag
      ref={ref}
      textValue={textValue}
      {...props}
      className={cn(
        "flex items-center gap-x-2 rounded-full  bg-neutral-200 px-3 py-1.5 text-sm font-medium text-neutral-900 outline-none",
        "data-[focus-visible]:ring-2 data-[focus-visible]:ring-sky-600 data-[focus-visible]:ring-offset-2",
        "group-has-[[data-pending]]:opacity-50 group-has-[[data-pending]]:pointer-events-none transition-all",
        className
      )}
    >
      {({ allowsRemoving }) => (
        <>
          {children}
          {allowsRemoving && (
            <Button
              slot="remove"
              className="p-1 group h-auto text-neutral-500 transition-colors  data-[hovered]:text-neutral-700 data-[hovered]:bg-neutral-300/50 rounded-full"
            >
              <Icons.x className="size-4" />
            </Button>
          )}
        </>
      )}
    </Tag>
  );
}

interface MyTagGroupProps<T>
  extends Omit<TagGroupProps, "children">,
    Pick<TagListProps<T>, "items" | "children" | "renderEmptyState"> {
  label?: string;
  labelClassName?: string;
  listClassName?: string;
}

function MyTagGroup<T extends object>({
  label,
  items,
  children,
  renderEmptyState,
  labelClassName,
  listClassName,
  ...props
}: MyTagGroupProps<T>) {
  return (
    <TagGroup {...props}>
      {label && (
        <Label className={cn("font-medium text-neutral-900", labelClassName)}>
          {label}
        </Label>
      )}
      <TagList
        items={items}
        renderEmptyState={renderEmptyState}
        className={cn("flex flex-wrap gap-2", listClassName)}
      >
        {children}
      </TagList>
    </TagGroup>
  );
}

export { MyTagGroup, MyTag };
