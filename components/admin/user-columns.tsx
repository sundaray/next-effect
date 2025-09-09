"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth/client";
import type { UserForAdminTable } from "@/lib/get-all-users";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "../ui/badge";

const UserActions = ({ row }: { row: { original: UserForAdminTable } }) => {
  const user = row.original;
  const router = useRouter();

  const handleImpersonate = async () => {
    await authClient.admin.impersonateUser({ userId: user.id });
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="size-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleImpersonate}>
          Impersonate User
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const userColumns: ColumnDef<UserForAdminTable>[] = [
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.original.role;
      return (
        <Badge
          variant={role === "admin" ? "default" : "secondary"}
          className="capitalize"
        >
          {role}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: UserActions,
  },
];
