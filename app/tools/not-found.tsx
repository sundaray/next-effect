import { ExclamationCircleIcon } from "@heroicons/react/24/solid";
import { HoverLink } from "@/components/hover-link";

export default function NotFound() {
  return (
    <div className="max-w-xl mx-auto flex flex-col place-items-center text-center my-36">
      <div>
        <ExclamationCircleIcon className="size-8 text-amber-500" />
      </div>
      <h2 className="text-2xl font-bold tracking-tight text-neutral-900 mt-6">
        App Not Found
      </h2>
      <p className="text-neutral-700 text-pretty mt-4">
        The app you're looking for could not be found or is no longer listed.
      </p>
      <HoverLink href="/" className="mt-6">
        Return Home
      </HoverLink>
    </div>
  );
}
