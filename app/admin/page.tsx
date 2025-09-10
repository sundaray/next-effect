import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { getAllSubmissions } from "@/lib/get-all-submissions";
import { getAllUsers } from "@/lib/get-all-users";
import { Suspense } from "react";

export default async function AdminPage() {
  const submissions = await getAllSubmissions();
  const users = await getAllUsers();

  return (
    <div className="group mx-auto my-36 max-w-4xl px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-neutral-900">
          Admin Dashboard
        </h1>
        <p className="mt-4 text-lg font-medium text-neutral-700">
          Review and manage all app submissions and users.
        </p>
      </div>
      <Suspense>
        <AdminDashboard submissions={submissions} users={users} />
      </Suspense>
    </div>
  );
}
