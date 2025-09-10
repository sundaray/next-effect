"use client";

import { AdminSubmissionColumns, Submission } from "@/components/admin/columns";
import { DataTable } from "@/components/admin/data-table";

interface AdminClientProps {
  submissions: Submission[];
}

export function UserSubmissionsTable({ submissions }: AdminClientProps) {
  const { columns, dialog } = AdminSubmissionColumns();

  return (
    <>
      <DataTable columns={columns} data={submissions} />
      {dialog}
    </>
  );
}
