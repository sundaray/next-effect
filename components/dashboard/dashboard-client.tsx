"use client";

import { SubmissionColumns } from "@/components/dashboard/columns";
import { DataTable } from "@/components/dashboard/data-table";
import type { Submission } from "@/components/dashboard/columns";

interface DashboardClientProps {
  submissions: Submission[];
}

export function DashboardClient({ submissions }: DashboardClientProps) {
  const { columns, dialog } = SubmissionColumns();

  return (
    <>
      <DataTable columns={columns} data={submissions} />
      {dialog}
    </>
  );
}
