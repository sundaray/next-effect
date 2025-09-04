import { ToolSubmissionForm } from "@/components/forms/tool-submission-form";
import { buttonVariants } from "@/components/ui/button";
import { APP_SUBMISSION_LIMIT } from "@/config/limit";
import { getCategories } from "@/lib/get-categories";
import { getUser } from "@/lib/get-user";
import { cn } from "@/lib/utils";
import { headers } from "next/headers";
import Link from "next/link";

export default async function Submit() {
  const requestHeaders = await headers();
  const user = await getUser(requestHeaders);
  const submissionCount = user?.submissionCount || 0;

  const categories = await getCategories("");

  if (submissionCount >= APP_SUBMISSION_LIMIT) {
    return (
      <div className="mx-auto my-36 max-w-xl px-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-neutral-900">
          Submission Limit Reached
        </h1>
        <p className="mt-4 text-neutral-700">
          You have already submitted {APP_SUBMISSION_LIMIT} apps, which is the
          maximum allowed.
        </p>
        <Link
          href="/dashboard"
          className={cn(
            buttonVariants({ variant: "default", size: "sm" }),
            "mt-8",
          )}
        >
          Go to Dashboard
        </Link>
      </div>
    );
  }
  return (
    <div className="mx-auto my-36 max-w-xl px-4">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-pretty text-neutral-900">
          Submit your AI app for free
        </h1>
        <p className="mt-4 text-lg text-pretty text-neutral-700">
          Get discovered by users and boost your SEO with a backlink.
        </p>
      </div>
      <ToolSubmissionForm categories={categories} />
    </div>
  );
}
