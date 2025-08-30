"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type Submission = {
  name: string;
  submittedAt: Date;
  status: "pending" | "approved" | "rejected";
};

const getStatusPillStyles = (status: Submission["status"]) => {
  switch (status) {
    case "approved":
      return "border-emerald-200 bg-emerald-200 text-emerald-900";
    case "pending":
      return "border-amber-200 bg-amber-200 text-amber-900";
    case "rejected":
      return "border-red-200 bg-red-200 text-red-900";
    default:
      return "border-neutral-200 bg-neutral-200 text-neutral-900";
  }
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
