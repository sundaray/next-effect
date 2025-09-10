"use client";

import { MySubmissionsTable } from "@/components/dashboard/my-submissions-table";
import type { Submission as MySubmissionsType } from "@/components/dashboard/my-submissions-table-columns";
import { UserManagementTable } from "@/components/dashboard/user-management-table";
import { UserSubmissionsTable } from "@/components/dashboard/user-submissions-table";
import type { Submission as AllSubmissionsType } from "@/components/dashboard/user-submissions-table-columns";
import { APP_SUBMISSION_LIMIT } from "@/config/limit";
import { siteConfig } from "@/config/navbar";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  dashboardAdminTabs,
  dashboardSearchParams,
} from "@/lib/dashboard-search-params";
import { UserForAdminTable } from "@/lib/get-all-users";
import type { User } from "@/lib/services/auth-service";
import { cn } from "@/lib/utils";
import { useQueryState } from "nuqs";
import { Tab, TabList, TabPanel, Tabs } from "react-aria-components";

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

  const isDesktop = useMediaQuery("(min-width: 640px)");

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
    <Tabs
      selectedKey={activeTab}
      onSelectionChange={(key) =>
        setActiveTab(key as (typeof dashboardAdminTabs)[number])
      }
      orientation={isDesktop ? "horizontal" : "vertical"}
    >
      <TabList
        items={siteConfig.adminNav}
        aria-label="Admin Dashboard Tabs"
        className="flex flex-col border-neutral-200 sm:flex-row sm:gap-6 sm:border-b"
      >
        {(item) => (
          <Tab
            id={item.id}
            className={({ isSelected }) =>
              cn(
                "w-full cursor-pointer px-3 py-3 text-left text-sm font-medium whitespace-nowrap ring-offset-2 outline-none focus-visible:ring-2 focus-visible:ring-sky-500 sm:w-auto sm:px-1 sm:py-4 sm:text-center", // Defines the border structure: left on mobile, bottom on desktop

                "border-l-2 sm:border-b-2 sm:border-l-0",

                isSelected
                  ? "border-sky-600 text-sky-700"
                  : "border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700", // Inactive state
              )
            }
          >
            {item.title}
          </Tab>
        )}
      </TabList>
      <TabPanel id={activeTab!} className="mt-8">
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
      </TabPanel>
    </Tabs>
  );
}
