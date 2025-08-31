import { ToolSubmissionForm } from "@/components/tool-submission-form";
import { getCategories } from "@/lib/get-categories";
import { getUser } from "@/lib/get-user";
import { headers } from "next/headers";
import Link from "next/link";
import { SUBMISSION_LIMIT } from "@/config/limit";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function Submit() {
  const requestHeaders = await headers();
  const user = await getUser(requestHeaders);
  const submissionCount = user?.submissionCount || 0;

  const categories = await getCategories("");

  if (submissionCount >= SUBMISSION_LIMIT) {
    return (
      <div className="max-w-xl mx-auto px-4 my-36 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-neutral-900">
          Submission Limit Reached
        </h1>
        <p className=" text-neutral-700 mt-4">
          You have already submitted {SUBMISSION_LIMIT} apps, which is the
          maximum allowed.
        </p>
        <Link
          href="/dashboard"
          className={cn(
            buttonVariants({ variant: "default", size: "sm" }),
            "mt-8"
          )}
        >
          Go to Dashboard
        </Link>
      </div>
    );
  }
  return (
    <div className="max-w-xl mx-auto px-4 my-36">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-neutral-900 text-pretty">
          Submit your AI app for free
        </h1>
        <p className="text-lg text-neutral-700 mt-4 text-pretty">
          Get discovered by users and boost your SEO with a backlink.
        </p>
      </div>
      <ToolSubmissionForm categories={categories} />
    </div>
  );
}
