export type NavItem = {
  title: string;
  href: string;
};

export type AdminNavItem = {
  id: "submission-management" | "user-management" | "my-submissions";
  title: string;
};
