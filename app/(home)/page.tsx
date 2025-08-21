// src/app/page.jsx (or wherever your HomePage is)

import { getTools } from "@/lib/get-tools";
import { ToolCard } from "@/components/tool-card";

export default async function HomePage() {
  const tools = await getTools();

  return (
    <div>
      <div className="@container w-full h-100 overflow-hidden">
        <div
          className="
        w-full h-full
        grid gap-1
        grid-cols-[repeat(auto-fit,2.5rem)]
        auto-rows-[2.5rem]
        justify-center
        content-center
        mask-radial-from-0% mask-radial-to-80%
        mask-radial-at-center
      "
        >
          {Array.from({ length: 400 }, (_, i) => (
            <div key={i} className="size-10 bg-neutral-100 rounded" />
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl mt-24">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {tools && tools.length > 0 ? (
            <>
              {tools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </>
          ) : (
            <p className="text-neutral-600 col-span-full text-center">
              No tools have been submitted yet. Be the first!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
