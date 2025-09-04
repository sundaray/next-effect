import { UserAccountNavClient } from "@/components/navigation/user-account-nav-client";
import { buttonVariants } from "@/components/ui/button";
import { getUser } from "@/lib/get-user";
import { cn } from "@/lib/utils";
import { headers } from "next/headers";
import Link from "next/link";

export async function UserAccountNav() {
  const requestHeaders = await headers();
  const user = await getUser(requestHeaders);

  return (
    <div className="hidden md:block">
      {user ? (
        <UserAccountNavClient user={user} />
      ) : (
        <Link
          href="/signin"
          className={cn(buttonVariants({ variant: "default", size: "sm" }))}
        >
          Sign In
        </Link>
      )}
    </div>
  );
}
