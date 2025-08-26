import React from "react";
import Link from "next/link";
import { NavItem } from "@/components/nav-item";
// import { MobileNav } from "@/components/mobile-nav";
import { UserAccountNav } from "@/components/user-account-nav";
import type { NavItem as NavItemType } from "@/types/navigation";

type MainNavProps = {
  items: NavItemType[];
};

export function MainNav({ items }: MainNavProps) {
  return (
    <div className="fixed inset-x-0 top-0 z-50 mx-auto flex h-20 max-w-6xl items-center justify-between px-4 bg-neutral-50">
      <Link
        href="/"
        aria-label="Go to homepage"
        className="mr-10 flex items-center font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-600"
      >
        IndieAITools
      </Link>
      <nav className="hidden md:block mr-auto">
        <ul className="flex space-x-4">
          {items.map((item) => (
            <li key={item.title}>
              <NavItem title={item.title} href={item.href} />
            </li>
          ))}
        </ul>
      </nav>
      {/* <MobileNav /> */}
      <UserAccountNav />
    </div>
  );
}
