import { CheckCircleIcon } from "@heroicons/react/24/solid";

export default function SubmitForReviewPage() {
  return (
    <div className="max-w-xl mx-auto flex flex-col place-items-center">
      <div>
        <CheckCircleIcon className="size-8 text-green-600" />
      </div>

      <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 text-center mt-6">
        Tool Submitted for Review
      </h2>

      <p className="text-neutral-700 text-pretty mt-4">
        Thank you for your submission! Your tool will be reviewed by our team
        within 24 hours. Once approved, it will appear in our tool directory.
      </p>

      <p className="text-neutral-700 mt-4 text-pretty">
        We&apos;ll notify you via email once the review is complete. If your
        submission doesn&apos;t meet our guidelines, we&apos;ll provide feedback
        on what needs to be changed.
      </p>
    </div>
  );
}
