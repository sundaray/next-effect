"use client";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { APP_RESUBMISSION_LIMIT } from "@/config/limit";
import { adminApprovalStatusEnum } from "@/db/schema";
import { cn, getStatusPillStyles } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useState } from "react";

export type Submission = {
  name: string;
  slug: string;
  submittedAt: Date;
  status: (typeof adminApprovalStatusEnum.enumValues)[number];
  rejectionReason: string | null;
  rejectionCount: number;
};

export const MySubmissionsTableColumns = (hasRejectedSubmissions: boolean) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] =
    useState<Submission | null>(null);

  const columns: ColumnDef<Submission>[] = [
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
        const submission = row.original;
        const status = submission.status;
        const isRejectedWithReason =
          (status === "rejected" || status === "permanently_rejected") &&
          submission.rejectionReason;

        return (
          <div className="flex items-center gap-x-2">
            <Badge
              className={cn(
                "font-medium capitalize",
                getStatusPillStyles(status),
              )}
            >
              {status}
            </Badge>
            {isRejectedWithReason && (
              <Button
                variant="link"
                className="h-auto p-0 text-xs text-sky-600"
                onClick={() => {
                  setSelectedSubmission(submission);
                  setDialogOpen(true);
                }}
              >
                Read Reason
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  if (hasRejectedSubmissions) {
    columns.push({
      id: "resubmissionAttempts",
      header: "Resubmission Attempts Left",
      cell: ({ row }) => {
        const submission = row.original;
        if (submission.status === "approved") {
          return <span className="text-neutral-500">N/A</span>;
        }
        const remaining =
          APP_RESUBMISSION_LIMIT - (submission.rejectionCount - 1);

        if (remaining < 0) return 0;

        return <span className="text-neutral-900">{remaining}</span>;
      },
    });
  }

  columns.push({
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const submission = row.original;

      if (submission.status === "rejected") {
        return (
          <Link
            href={`/submit?edit=${submission.slug}`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Edit
          </Link>
        );
      }

      return null;
    },
  });

  return {
    columns,
    dialog: (
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Rejection Reason for "{selectedSubmission?.name}"
            </DialogTitle>
            <ScrollArea className="mt-4 max-h-64 pr-6">
              <DialogDescription className="text-base text-neutral-700">
                {selectedSubmission?.rejectionReason ||
                  "No reason was provided."}
              </DialogDescription>
            </ScrollArea>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    ),
  };
};
