"use client";

import type { Submission } from "@/components/admin/columns";
import { SubmissionsClient } from "@/components/admin/submissions-client";
import { UserManagementClient } from "@/components/admin/user-management-client";
import { siteConfig } from "@/config/navbar";
import { adminSearchParams } from "@/lib/admin-search-params";
import { UserForAdminTable } from "@/lib/get-all-users";
import { cn } from "@/lib/utils";
import { useQueryState } from "nuqs";

interface AdminDashboardProps {
  submissions: Submission[];
  users: UserForAdminTable[];
}

export function AdminDashboard({ submissions, users }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useQueryState("tab", adminSearchParams.tab);

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
        {activeTab === "submissions" && (
          <SubmissionsClient submissions={submissions} />
        )}
        {activeTab === "users" && <UserManagementClient users={users} />}
      </div>
    </div>
  );
}
