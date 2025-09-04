import { AdminClient } from "@/components/admin/dashboard-client";
import { getAllSubmissions } from "@/lib/get-all-submissions";

export default async function AdminPage() {
  const submissions = await getAllSubmissions();

  return (
    <div className="group mx-auto my-36 max-w-4xl px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-neutral-900">
          Admin Dashboard
        </h1>
        <p className="mt-4 text-neutral-700">
          Review and manage all app submissions.
        </p>
      </div>

      <AdminClient submissions={submissions} />
    </div>
  );
}
