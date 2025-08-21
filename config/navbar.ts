import type { NavItem } from "@/types/navigation";

type NavbarConfig = {
  main: NavItem[];
};

export const navbarLinks: NavbarConfig = {
  main: [
    { title: "Submit", href: "/submit" },
    { title: "Categories", href: "/categories" },
  ],
};
