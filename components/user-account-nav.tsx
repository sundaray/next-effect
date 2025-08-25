import React from "react";
import Link from "next/link";
import { headers } from "next/headers";
import { getUser } from "@/lib/get-user";
import { UserAccountNavClient } from "@/components/user-account-nav-client";

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
          className="inline-flex items-center rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-900/90"
        >
          Sign In
        </Link>
      )}
    </div>
  );
}
