import { LockClosedIcon } from "@heroicons/react/24/solid";
import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="max-w-xl mx-auto flex flex-col place-items-center text-center">
      <div>
        <LockClosedIcon className="size-10 text-amber-500" />
      </div>
      <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 mt-6">
        Access Denied
      </h2>
      <p className="text-neutral-700 text-pretty mt-4">
        This page can only be accessed by users with admin privileges.
      </p>
      <Link
        href="/"
        className="mt-6 text-sky-600 hover:text-sky-800 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:ring-offset-2"
      >
        Return to Home
      </Link>{" "}
    </div>
  );
}
