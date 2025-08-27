import React from "react";
import Link from "next/link";
import { headers } from "next/headers";
import { getUser } from "@/lib/get-user";
import { UserAccountNavClient } from "@/components/user-account-nav-client";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
