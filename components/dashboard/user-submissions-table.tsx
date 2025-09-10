"use client";

import { DataTable } from "@/components/dashboard/data-table";
import {
  AdminSubmissionColumns,
  Submission,
} from "@/components/dashboard/user-submissions-table-columns";

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
