import React from "react";
import Link from "next/link";
import { getUser } from "@/lib/auth/shared/get-user";
import { UserAccountNavClient } from "@/components/user-account-nav-client";

export async function UserAccountNav() {
  const user = await getUser();

  return (
    <div className="hidden md:block">
      {user ? (
        <UserAccountNavClient user={user} />
      ) : (
        <Link
          href="/signin"
          className="inline-flex items-center rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-900/90"
        >
          Sign In
        </Link>
      )}
    </div>
  );
}
