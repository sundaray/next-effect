import { getAllSubmissions } from "@/lib/get-all-submissions";
import { AdminClient } from "@/components/admin/dashboard-client";

export default async function AdminPage() {
  const submissions = await getAllSubmissions();

  return (
    <div className="max-w-4xl mx-auto px-4 my-36 group">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-neutral-900">
          Admin Dashboard
        </h1>
        <p className="text-neutral-700 mt-4">
          Review and manage all app submissions.
        </p>
      </div>

      <AdminClient submissions={submissions} />
    </div>
  );
}
