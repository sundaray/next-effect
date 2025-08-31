import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/get-user";
import { getUserSubmissions } from "@/lib/get-user-submissions";
import { DashboardClient } from "@/components/user/dashboard-client";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { SUBMISSION_LIMIT } from "@/config/limit";

export default async function DashboardPage() {
  const requestHeaders = await headers();
  const user = await getUser(requestHeaders);

  if (!user) {
    redirect("/signin");
  }

  const submissions = await getUserSubmissions(user.id);

  const submissionCount = user.submissionCount || 0;
  const remainingSubmissions = SUBMISSION_LIMIT - submissionCount;

  let submissionMessage = "";
  if (remainingSubmissions > 1) {
    submissionMessage = `You can make ${remainingSubmissions} more app submissions.`;
  } else if (remainingSubmissions === 1) {
    submissionMessage = `You can make 1 more app submission.`;
  } else {
    submissionMessage = `You have reached your submission limit of ${SUBMISSION_LIMIT} apps.`;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 my-36 group">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-neutral-900">
          My Submissions
        </h1>
        <p className="text-neutral-700 mt-4">
          View the status of all your app submissions.
        </p>
      </div>
      {submissions.length > 0 ? (
        <>
          <div className="mb-4 p-3 text-sm text-sky-800 bg-sky-100 border border-sky-200 rounded-md">
            {submissionMessage}
          </div>
          <DashboardClient submissions={submissions} />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-neutral-300 rounded-md">
          <p className="text-neutral-700">
            You have not submitted any apps yet.
          </p>
          <Link
            href="/submit"
            className={cn(buttonVariants({ variant: "default" }), "mt-4")}
          >
            Submit an App
          </Link>
        </div>
      )}
    </div>
  );
}
