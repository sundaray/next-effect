"use client";

import { DataTable } from "@/components/dashboard/data-table";
import { userManagementTableColumns } from "@/components/dashboard/user-management-table-columns";
import type { UserForAdminTable } from "@/lib/get-all-users";
interface UserManagementClientProps {
  users: UserForAdminTable[];
}

export function UserManagementTable({ users }: UserManagementClientProps) {
  return <DataTable columns={userManagementTableColumns} data={users} />;
}
