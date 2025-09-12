import { AdminDashboard } from "@/components/dashboard/admin-dashboard";
import { UserDashboard } from "@/components/dashboard/user-dashboard";
import { buttonVariants } from "@/components/ui/button";
import { APP_RESUBMISSION_LIMIT, APP_SUBMISSION_LIMIT } from "@/config/limit";
import { getAllSubmissions } from "@/lib/get-all-submissions";
import { getAllUsers } from "@/lib/get-all-users";
import { getUser } from "@/lib/get-user";
import { getUserSubmissions } from "@/lib/get-user-submissions";
import { cn } from "@/lib/utils";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default async function DashboardPage() {
  const requestHeaders = await headers();
  const user = await getUser(requestHeaders);

  if (!user) {
    redirect("/signin");
  }

  if (user.role === "admin") {
    const allSubmissions = await getAllSubmissions();
    const allUsers = await getAllUsers();
    const mySubmissions = await getUserSubmissions(user.id);

    return (
      <div className="group mx-auto my-36 max-w-4xl px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-neutral-900">
            Admin Dashboard
          </h1>
          <p className="mt-4 text-lg text-neutral-700">
            Review and manage all app submissions and users.
          </p>
        </div>
        <Suspense>
          <AdminDashboard
            allSubmissions={allSubmissions}
            allUsers={allUsers}
            mySubmissions={mySubmissions}
            user={user}
          />
        </Suspense>
      </div>
    );
  }

  const submissions = await getUserSubmissions(user.id);

  const submissionCount = user.submissionCount || 0;
  const remainingSubmissions = APP_SUBMISSION_LIMIT - submissionCount;

  let submissionMessage = `Currently, all users are allowed a maximum of ${APP_SUBMISSION_LIMIT} app submissions. `;

  if (remainingSubmissions > 1) {
    submissionMessage += `You can make ${remainingSubmissions} more submissions.`;
  } else if (remainingSubmissions === 1) {
    submissionMessage += `You can make 1 more submission.`;
  } else {
    submissionMessage += `You have reached your submission limit.`;
  }

  const hasRejectedSubmissions = submissions.some(
    (submission) => submission.status === "rejected",
  );

  return (
    <div className="group mx-auto my-36 max-w-4xl px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-neutral-900">
          My Submissions
        </h1>
        <p className="mt-4 text-lg text-neutral-700">
          View the status of all your app submissions.
        </p>
      </div>
      {submissions.length > 0 ? (
        <>
          <div className="mb-4 rounded-md border border-sky-200 bg-sky-100 px-3 py-1.5 text-sm text-pretty text-sky-900">
            {submissionMessage}
          </div>
          <UserDashboard
            submissions={submissions}
            hasRejectedSubmissions={hasRejectedSubmissions}
          />
          {hasRejectedSubmissions && (
            <p className="mt-4 text-sm text-pretty text-neutral-700">
              <span className="font-semibold text-neutral-900">
                * Edit Policy:{" "}
              </span>
              A rejected app can be edited and resubmitted up to{" "}
              {APP_RESUBMISSION_LIMIT} times. After the second unsuccessful
              resubmission, the app will be permanently rejected.
            </p>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-neutral-300 p-8 text-center">
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
