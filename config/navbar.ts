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
    { id: "submission-management", title: "Submission Management" },
    { id: "user-management", title: "User Management" },
    { id: "my-submissions", title: "My Submissions" },
  ],
};
