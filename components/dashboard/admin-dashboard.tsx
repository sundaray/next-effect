"use client";
import { MySubmissionsTable } from "@/components/dashboard/my-submissions-table";
import type { Submission as MySubmissionsType } from "@/components/dashboard/my-submissions-table-columns";
import { UserManagementTable } from "@/components/dashboard/user-management-table";
import { UserSubmissionsTable } from "@/components/dashboard/user-submissions-table";
import type { Submission as AllSubmissionsType } from "@/components/dashboard/user-submissions-table-columns";
import { APP_SUBMISSION_LIMIT } from "@/config/limit";
import { siteConfig } from "@/config/navbar";
import { dashboardSearchParams } from "@/lib/dashboard-search-params";
import { UserForAdminTable } from "@/lib/get-all-users";
import type { User } from "@/lib/services/auth-service";
import { cn } from "@/lib/utils";
import { useQueryState } from "nuqs";

interface AdminDashboardProps {
  allSubmissions: AllSubmissionsType[];
  allUsers: UserForAdminTable[];
  mySubmissions: MySubmissionsType[];
  user: User;
}

export function AdminDashboard({
  allSubmissions,
  allUsers,
  mySubmissions,
  user,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useQueryState(
    "tab",
    dashboardSearchParams.tab,
  );

  const hasRejectedSubmissions = mySubmissions.some(
    (submission) => submission.status === "rejected",
  );

  const submissionCount = user?.submissionCount || 0;
  const remainingSubmissions = APP_SUBMISSION_LIMIT - submissionCount;
  let submissionMessage = `As a user, you are allowed a maximum of ${APP_SUBMISSION_LIMIT} app submissions. `;
  if (remainingSubmissions > 1) {
    submissionMessage += `You can make ${remainingSubmissions} more submissions.`;
  } else if (remainingSubmissions === 1) {
    submissionMessage += `You can make 1 more submission.`;
  } else {
    submissionMessage += `You have reached your submission limit.`;
  }

  return (
    <div>
      <div className="border-b border-neutral-200">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          {siteConfig.adminNav.map((link) => (
            <button
              key={link.id}
              onClick={() => setActiveTab(link.id)}
              className={cn(
                "border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap",
                activeTab === link.id
                  ? "border-sky-600 text-sky-600"
                  : "border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700",
              )}
            >
              {link.title}
            </button>
          ))}
        </nav>
      </div>
      <div className="mt-8">
        {activeTab === "submission-management" && (
          <UserSubmissionsTable submissions={allSubmissions} />
        )}
        {activeTab === "user-management" && (
          <UserManagementTable users={allUsers} />
        )}
        {activeTab === "my-submissions" && (
          <>
            <div className="mb-4 rounded-md border border-sky-200 bg-sky-100 px-3 py-1.5 text-sm text-pretty text-sky-900">
              {submissionMessage}
            </div>
            <MySubmissionsTable
              submissions={mySubmissions}
              hasRejectedSubmissions={hasRejectedSubmissions}
            />
          </>
        )}
      </div>
    </div>
  );
}
