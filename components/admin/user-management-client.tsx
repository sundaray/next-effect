"use client";

import { DataTable } from "@/components/admin/data-table";
import { userColumns } from "@/components/admin/user-columns";
import type { UserForAdminTable } from "@/lib/get-all-users";

interface UserManagementClientProps {
  users: UserForAdminTable[];
}

export function UserManagementClient({ users }: UserManagementClientProps) {
  return <DataTable columns={userColumns} data={users} />;
}
