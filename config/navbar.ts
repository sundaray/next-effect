import type { AdminNavItem, NavItem } from "@/types/navigation";

type SiteConfig = {
  mainNav: NavItem[];
  adminNav: AdminNavItem[];
};

export const siteConfig: SiteConfig = {
  mainNav: [
    { title: "Submit", href: "/submit" },
    { title: "Categories", href: "/categories" },
  ],
  adminNav: [
    { id: "submissions", title: "User Submissions" },
    { id: "users", title: "User Management" },
  ],
};
