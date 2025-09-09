import { HoverLink } from "@/components/hover-link";
import { LockClosedIcon } from "@heroicons/react/24/solid";

export default function UnauthorizedPage() {
  return (
    <div className="mx-auto my-36 flex max-w-xl flex-col place-items-center text-center">
      <div>
        <LockClosedIcon className="size-8 text-amber-500" />
      </div>
      <h2 className="mt-6 text-2xl font-semibold tracking-tight text-neutral-900">
        Access Denied
      </h2>
      <p className="mt-4 text-pretty text-neutral-700">
        This page can only be accessed by users with admin privileges.
      </p>
      <HoverLink href="/" className="mt-6">
        Return Home
      </HoverLink>
    </div>
  );
}
