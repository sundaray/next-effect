"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { getStatusPillStyles } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { adminApprovalStatusEnum } from "@/db/schema";

export type Submission = {
  name: string;
  submittedAt: Date;
  status: (typeof adminApprovalStatusEnum.enumValues)[number];
  rejectionReason: string | null;
};

export const SubmissionColumns = () => {
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
          status === "rejected" && submission.rejectionReason;

        return (
          <div className="flex items-center gap-x-2">
            <Badge
              className={cn(
                "font-medium capitalize",
                getStatusPillStyles(status)
              )}
            >
              {status}
            </Badge>
            {isRejectedWithReason && (
              <Button
                variant="link"
                className="h-auto p-0 text-sky-600 text-xs"
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

  return {
    columns,
    dialog: (
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Rejection Reason for "{selectedSubmission?.name}"
            </DialogTitle>
            <ScrollArea className="max-h-64 mt-4 pr-6">
              <DialogDescription className="text-neutral-700 text-base">
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
