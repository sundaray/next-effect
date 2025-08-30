import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/get-user";
import { getUserSubmissions } from "@/lib/get-user-submissions";
import { columns } from "@/components/dashboard/columns";
import { DataTable } from "@/components/dashboard/data-table";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default async function DashboardPage() {
  const requestHeaders = await headers();
  const user = await getUser(requestHeaders);

  if (!user) {
    redirect("/signin");
  }

  const submissions = await getUserSubmissions(user.id);

  return (
    <div className="max-w-4xl mx-auto px-4 my-36 group">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
          My Submissions
        </h1>
        <p className="text-neutral-700 mt-2">
          View the status of all your app submissions.
        </p>
      </div>
      {submissions.length > 0 ? (
        <DataTable columns={columns} data={submissions} />
      ) : (
        <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-neutral-300 rounded-md">
          <p className="text-neutral-700">
            You have not submitted any apps yet.
          </p>
          <Link
            href="/submit"
            className={cn(buttonVariants({ variant: "default" }), "mt-4")}
          >
            Submit an App
          </Link>
        </div>
      )}
    </div>
  );
}
