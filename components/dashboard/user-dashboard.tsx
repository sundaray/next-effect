"use client";

import type { Submission } from "@/components/user/columns";
import { SubmissionColumns } from "@/components/user/columns";
import { DataTable } from "@/components/user/data-table";

interface DashboardClientProps {
  submissions: Submission[];
  hasRejectedSubmissions: boolean;
}

export function DashboardClient({
  submissions,
  hasRejectedSubmissions,
}: DashboardClientProps) {
  const { columns, dialog } = SubmissionColumns(hasRejectedSubmissions);

  return (
    <>
      <DataTable columns={columns} data={submissions} />
      {dialog}
    </>
  );
}
