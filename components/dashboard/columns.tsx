"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getStatusPillStyles } from "@/lib/utils";

export type Submission = {
  name: string;
  submittedAt: Date;
  status: "pending" | "approved" | "rejected";
};

export const columns: ColumnDef<Submission>[] = [
  {
    accessorKey: "name",
    header: "App Name",
  },
  {
    accessorKey: "submittedAt",
    header: "Submission Date",
    cell: ({ row }) => {
      const date = new Date(row.getValue("submittedAt"));
      const formatted = new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
      }).format(date);
      return <div>{formatted}</div>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status: Submission["status"] = row.getValue("status");
      return (
        <Badge
          className={cn("font-medium capitalize", getStatusPillStyles(status))}
        >
          {status}
        </Badge>
      );
    },
  },
];
