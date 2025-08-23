"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem as NavItemType } from "@/types/navigation";
import { cn } from "@/lib/utils";

export function NavItem({ href, title }: NavItemType) {
  const pathname = usePathname();
  const isActive = href === pathname;

  return (
    <Link
      className={cn(
        // Base styles for the link
        "relative py-2 text-sm font-medium text-neutral-700 transition-colors hover:text-neutral-700",

        // Pseudo-element for the underline
        "after:content-[''] after:absolute after:bottom-1.5 after:left-0 after:h-[1.5px] after:w-0 after:bg-neutral-900 after:transition-all after:duration-200 after:ease-out",

        // Hover state for the pseudo-element
        "hover:after:w-full",

        // Active state styles
        isActive && "text-neutral-900 font-semibold"
      )}
      href={href}
    >
      {title}
    </Link>
  );
}
