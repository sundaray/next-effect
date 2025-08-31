import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/get-user";
import { getUserSubmissions } from "@/lib/get-user-submissions";
import { DashboardClient } from "@/components/user/dashboard-client";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { APP_SUBMISSION_LIMIT, APP_RESUBMISSION_LIMIT } from "@/config/limit";

export default async function DashboardPage() {
  const requestHeaders = await headers();
  const user = await getUser(requestHeaders);

  if (!user) {
    redirect("/signin");
  }

  const submissions = await getUserSubmissions(user.id);

  const submissionCount = user.submissionCount || 0;
  const remainingSubmissions = APP_SUBMISSION_LIMIT - submissionCount;

  let submissionMessage = `Currently, all users are allowed a maximum of ${APP_SUBMISSION_LIMIT} app submissions. `;

  if (remainingSubmissions > 1) {
    submissionMessage += `You have ${remainingSubmissions} submissions remaining.`;
  } else if (remainingSubmissions === 1) {
    submissionMessage += `You have 1 submission remaining.`;
  } else {
    submissionMessage += `You have reached your submission limit.`;
  }

  const hasRejectedSubmissions = submissions.some(
    (submission) => submission.status === "rejected"
  );

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
          <div className="text-sm text-sky-900 bg-sky-100 border border-sky-200 px-3 py-1.5 mb-4 rounded-md text-pretty">
            {submissionMessage}
          </div>
          <DashboardClient
            submissions={submissions}
            hasRejectedSubmissions={hasRejectedSubmissions}
          />
          {hasRejectedSubmissions && (
            <p className="mt-4 text-sm text-neutral-700 text-pretty">
              <span className="font-semibold text-neutral-900">
                * Resubmission Policy:{" "}
              </span>
              A rejected app can be resubmitted up to {APP_RESUBMISSION_LIMIT}{" "}
              times. After the second unsuccessful resubmission, the app will be
              permanently rejected.
            </p>
          )}
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
