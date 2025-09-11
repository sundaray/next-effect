import { HoverLink } from "@/components/hover-link";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

export default function EditSuccessPage() {
  return (
    <div className="mx-auto my-36 flex max-w-xl flex-col place-items-center text-center">
      <div>
        <CheckCircleIcon className="size-8 text-green-600" />
      </div>
      <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-neutral-900">
        Edit Successful
      </h2>
      <p className="mt-4 text-pretty text-neutral-700">
        The changes to the app have been saved.
      </p>
      <HoverLink href="/dashboard" className="mt-6">
        Return to Dashboard
      </HoverLink>
    </div>
  );
}
