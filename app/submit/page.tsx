import { ToolSubmissionForm } from "@/components/tool-submission-form";

export default function Submit() {
  return (
    <div className="max-w-xl mx-auto px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-semibold tracking-tight text-neutral-900 text-pretty">
          Submit your AI app for free
        </h1>
        <p className="text-lg text-neutral-700 mt-4 text-pretty">
          Get discovered by users and boost your SEO with a backlink.
        </p>
      </div>
      <ToolSubmissionForm />
    </div>
  );
}
