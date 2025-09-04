import { HoverLink } from "@/components/hover-link";
import { ExclamationCircleIcon } from "@heroicons/react/24/solid";

export default function NotFound() {
  return (
    <div className="mx-auto my-36 flex max-w-xl flex-col place-items-center text-center">
      <div>
        <ExclamationCircleIcon className="size-8 text-amber-500" />
      </div>
      <h2 className="mt-6 text-2xl font-bold tracking-tight text-neutral-900">
        App Not Found
      </h2>
      <p className="mt-4 text-pretty text-neutral-700">
        The app you're looking for could not be found or is no longer listed.
      </p>
      <HoverLink href="/" className="mt-6">
        Return Home
      </HoverLink>
    </div>
  );
}
