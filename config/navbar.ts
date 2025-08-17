import type { NavItem } from "@/types/navigation";

type NavbarConfig = {
  main: NavItem[];
};

export const navbarLinks: NavbarConfig = {
  main: [
    { title: "Client", href: "/client" },
    { title: "Server", href: "/server" },
  ],
};
