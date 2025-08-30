"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { hc, parseResponse, DetailedError } from "hono/client";
import type { ApiRoutes } from "@/app/api/[[...path]]/route";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn, getStatusPillStyles } from "@/lib/utils";
import { Icons } from "@/components/icons";

const client = hc<ApiRoutes>(process.env.NEXT_PUBLIC_BASE_URL!);

export type Submission = {
  id: string;
  name: string;
  slug: string;
  submittedAt: Date;
  status: "pending" | "approved" | "rejected";
  submittedByEmail: string | null;
};

// --- RowActions Component ---
function RowActions({ row }: { row: { original: Submission } }) {
  const submission = row.original;
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

  /*************************************************
   *
   * Approval Handler
   *
   *************************************************/
  function handleApprove() {
    if (!submission.submittedByEmail) return;
    setError(null);
    startTransition(async () => {
      setError(null);
      try {
        await parseResponse(
          client.api.admin.submissions[":id"].approve.$post({
            param: { id: submission.id },
          })
        );
        setIsApproveDialogOpen(false);
        router.refresh();
      } catch (err) {
        if (err instanceof DetailedError) {
          const { data } = await err.detail;
          setError(data.message);
        } else {
          setError("A network error occurred. Please try again.");
        }
      }
    });
  }

  /*************************************************
   *
   * Rejection Handler
   *
   *************************************************/

  function handleReject() {
    if (!reason.trim() || !submission.submittedByEmail) return;
    setError(null);
    startTransition(async () => {
      try {
        await parseResponse(
          client.api.admin.submissions[":id"].reject.$post({
            param: { id: submission.id },
            json: { reason },
          })
        );
        setIsRejectDialogOpen(false);
        setReason("");
        router.refresh();
      } catch (err) {
        if (err instanceof DetailedError) {
          const { data } = await err.detail;
          setError(data.message);
        } else {
          setError("A network error occurred. Please try again.");
        }
      }
    });
  }

  return (
    <>
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {submission.status !== "approved" && (
            <DropdownMenuItem
              className="text-emerald-600 focus:text-emerald-600 focus:bg-emerald-50"
              onSelect={() => {
                setError(null);
                setIsApproveDialogOpen(true);
                setIsDropdownOpen(false);
              }}
            >
              Approve
            </DropdownMenuItem>
          )}

          {submission.status !== "rejected" && (
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600 focus:bg-red-50"
              onSelect={() => {
                setError(null);
                setReason("");
                setIsRejectDialogOpen(true);
                setIsDropdownOpen(false);
              }}
            >
              Reject
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/*************************************************
       *
       * Approve Dialog
       *
       *************************************************/}
      <AlertDialog
        open={isApproveDialogOpen}
        onOpenChange={setIsApproveDialogOpen}
      >
        <AlertDialogContent>
          {error && (
            <div className="text-sm text-red-600 rounded-md px-3 py-2 bg-red-100 border border-red-200">
              <p>{error}</p>
            </div>
          )}
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Submission?</AlertDialogTitle>
            <AlertDialogDescription className="text-neutral-700">
              Are you sure you want to approve{" "}
              <span className="font-medium text-neutral-900">
                {submission.name}
              </span>
              ? An email will be sent to the user, and the app will become
              publicly visible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <Button
              onClick={handleApprove}
              disabled={isPending}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isPending ? (
                <>
                  <Icons.spinner className="size-4 animate-spin" />
                  Approving...
                </>
              ) : (
                "Approve"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/*************************************************
       *
       * Reject Dialog
       *
       *************************************************/}

      <AlertDialog
        open={isRejectDialogOpen}
        onOpenChange={setIsRejectDialogOpen}
      >
        <AlertDialogContent>
          {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Submission?</AlertDialogTitle>
            <AlertDialogDescription className="text-neutral-700">
              Please provide a reason for rejecting{" "}
              <span className="font-medium text-neutral-900">
                {submission.name}
              </span>
              . This will be sent to the user. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid gap-2">
            <Label htmlFor="reason">Reason</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Showcase image is blurry or low quality."
              disabled={isPending}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <Button
              onClick={handleReject}
              disabled={isPending || !reason.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              {isPending ? (
                <>
                  <Icons.spinner className="size-4 animate-spin" />
                  Rejecting...
                </>
              ) : (
                "Reject"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// --- Columns Definition ---
export const columns: ColumnDef<Submission>[] = [
  {
    accessorKey: "name",
    header: "App Name",
  },
  {
    accessorKey: "submittedAt",
    header: "Submission Date",
    cell: ({ row }) =>
      new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(
        row.getValue("submittedAt")
      ),
  },
  {
    accessorKey: "submittedByEmail",
    header: "Submitted By",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as Submission["status"];
      return (
        <Badge className={cn("capitalize", getStatusPillStyles(status))}>
          {status}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: RowActions,
  },
];
