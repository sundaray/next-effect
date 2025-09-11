import { ToolSubmissionForm } from "@/components/forms/tool-submission-form";
import { buttonVariants } from "@/components/ui/button";
import { APP_SUBMISSION_LIMIT } from "@/config/limit";
import type { Tool } from "@/db/schema";
import { getCategories } from "@/lib/get-categories";
import { getToolBySlug } from "@/lib/get-tool-by-slug";
import { getToolForEdit } from "@/lib/get-tool-for-edit";
import { getUser } from "@/lib/get-user";
import { cn } from "@/lib/utils";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Submit(props: PageProps<"/submit">) {
  const requestHeaders = await headers();
  const user = await getUser(requestHeaders);

  if (!user) {
    redirect("/signin?next=/submit");
  }

  let initialData: Tool | null = null;

  const searchParams = await props.searchParams;
  const editSlug =
    typeof searchParams.edit === "string" ? searchParams.edit : undefined;

  if (editSlug) {
    if (user.role === "admin") {
      initialData = await getToolBySlug(editSlug);
    } else {
      initialData = await getToolForEdit(editSlug, user.id);
    }

    if (!initialData) {
      redirect("/dashboard");
    }
  }

  const submissionCount = user?.submissionCount || 0;

  const categories = await getCategories("");

  if (submissionCount >= APP_SUBMISSION_LIMIT && !initialData) {
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
          {initialData ? "Edit Submission" : "Submit your AI app for free"}
        </h1>
        <p className="mt-4 text-lg text-pretty text-neutral-700">
          {initialData
            ? "Make the necessary changes and resubmit your app for review."
            : "Get discovered by users and boost your SEO with a backlink."}
        </p>
      </div>
      <ToolSubmissionForm
        categories={categories}
        initialData={initialData}
        user={user}
      />
    </div>
  );
}
