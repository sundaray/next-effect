import { CheckCircleIcon } from "@heroicons/react/24/solid";

export default function SubmitForReviewPage() {
  return (
    <div className="max-w-xl mx-auto flex flex-col place-items-center text-center my-36">
      <div>
        <CheckCircleIcon className="size-8 text-green-600" />
      </div>

      <h2 className="text-2xl font-bold tracking-tight text-neutral-900 mt-6 text-center">
        Submitted for Review
      </h2>

      <p className="text-neutral-700 text-pretty mt-4">
        Thank you for your submission! Your app will be reviewed by our team
        within 24 hours. Once reviewed, you&apos;ll receive an email letting you
        know if your submission was approved or rejected.
      </p>

      <p className="text-neutral-700 mt-4 text-pretty">
        If approved, your app will appear in our directory. If rejected, the
        email will include specific feedback on what needs to be changed. You
        can then incorporate this feedback and resubmit for approval.
      </p>
    </div>
  );
}
