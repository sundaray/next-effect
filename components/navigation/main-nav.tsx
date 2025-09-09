import { MobileNav } from "@/components/navigation/mobile-nav";
import { NavItem } from "@/components/navigation/nav-item";
import { UserAccountNav } from "@/components/navigation/user-account-nav";
import { getUser } from "@/lib/get-user";
import { cn } from "@/lib/utils";
import type { NavItem as NavItemType } from "@/types/navigation";
import { headers } from "next/headers";
import Link from "next/link";

type MainNavProps = {
  items: NavItemType[];
};

export async function MainNav({ items }: MainNavProps) {
  const requestHeaders = await headers();
  const user = await getUser(requestHeaders);
  return (
    <div
      className={cn(
        "fixed inset-x-0 top-0 z-40 mx-auto flex h-20 max-w-6xl items-center justify-between bg-neutral-50 px-4",
      )}
    >
      {" "}
      <Link
        href="/"
        aria-label="Go to homepage"
        className="mr-10 flex items-center font-bold tracking-tight focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-600"
      >
        INDIEAITOOLS
      </Link>
      <nav className="mr-auto hidden md:block">
        <ul className="flex space-x-4">
          {items.map((item) => (
            <li key={item.title}>
              <NavItem title={item.title} href={item.href} />
            </li>
          ))}
        </ul>
      </nav>
      <MobileNav user={user} />
      <UserAccountNav />
    </div>
  );
}
