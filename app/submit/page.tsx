import { ToolSubmissionForm } from "@/components/tool-submission-form";
import { getCategories } from "@/lib/get-categories";

export default async function Submit() {
  const categories = await getCategories();
  return (
    <div className="max-w-xl mx-auto px-4 my-36">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-neutral-900 text-pretty">
          Submit your AI app for free
        </h1>
        <p className="text-lg text-neutral-700 mt-4 text-pretty">
          Get discovered by users and boost your SEO with a backlink.
        </p>
      </div>
      <ToolSubmissionForm categories={categories} />
    </div>
  );
}
