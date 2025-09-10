"use client";

import { DataTable } from "@/components/dashboard/data-table";
import type { Submission } from "@/components/dashboard/my-submissions-table-columns";
import { MySubmissionsTableColumns } from "@/components/dashboard/my-submissions-table-columns";

interface MySubmissionsTableProps {
  submissions: Submission[];
  hasRejectedSubmissions: boolean;
}

export function MySubmissionsTable({
  submissions,
  hasRejectedSubmissions,
}: MySubmissionsTableProps) {
  const { columns, dialog } = MySubmissionsTableColumns(hasRejectedSubmissions);

  return (
    <>
      <DataTable columns={columns} data={submissions} />
      {dialog}
    </>
  );
}
