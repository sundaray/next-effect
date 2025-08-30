import { getAllSubmissions } from "@/lib/get-all-submissions";
import { columns } from "@/components/admin/columns";
import { DataTable } from "@/components/admin/data-table";

export default async function AdminPage() {
  const submissions = await getAllSubmissions();

  return (
    <div className="max-w-4xl mx-auto px-4 my-36 group">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
          Admin Dashboard
        </h1>
        <p className="text-neutral-700 mt-4">
          Review and manage all app submissions.
        </p>
      </div>

      <DataTable columns={columns} data={submissions} />
    </div>
  );
}
