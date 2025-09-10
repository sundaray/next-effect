"use client";

import { Icons } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
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
import { useRouter } from "nextjs-toploader/app";
import { useState } from "react";

const UserActions = ({ row }: { row: { original: UserForAdminTable } }) => {
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const user = row.original;
  const router = useRouter();

  const handleImpersonate = async () => {
    setIsImpersonating(true);
    try {
      await authClient.admin.impersonateUser({ userId: user.id });
      router.replace("/");
      router.refresh();
    } catch (error) {
      console.error("Failed to impersonate user:", error);
    } finally {
      setIsImpersonating(false);
      setIsMenuOpen(false);
    }
  };
  return (
    <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="size-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            handleImpersonate();
          }}
          disabled={isImpersonating}
        >
          {isImpersonating && <Icons.spinner className="size-4 animate-spin" />}
          {isImpersonating ? "Impersonating..." : "Impersonate User"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const userManagementTableColumns: ColumnDef<UserForAdminTable>[] = [
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
    header: "Actions",
    cell: UserActions,
  },
];
