import Link from "next/link";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";

type HoverLinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
};

export function HoverLink({ href, children, className }: HoverLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center text-base font-medium text-sky-600 hover:text-sky-800 transition-colors",
        "focus-visible:outline-none",
        "focus-visible:ring-2",
        "focus-visible:ring-sky-600",
        "focus-visible:ring-offset-4",
        className
      )}
    >
      <span>{children}</span>

      <Icons.chevronRight
        className={cn(
          "ml-1 size-5",
          "opacity-0",
          "transition-all duration-200 ease-in-out",
          "group-hover:opacity-100",
          "group-hover:translate-x-0.5"
        )}
        aria-hidden="true"
      />
    </Link>
  );
}
