export function ToolHero() {
  return (
    <div className="relative h-100 w-full overflow-hidden">
      <div className="grid h-full w-full auto-rows-[2.5rem] grid-cols-[repeat(auto-fit,2.5rem)] content-center justify-center gap-1 mask-radial-from-0% mask-radial-to-80% mask-radial-at-center">
        {Array.from({ length: 400 }, (_, i) => (
          <div key={i} className="size-10 rounded bg-neutral-100" />
        ))}
      </div>
      <div className="absolute inset-0 z-10 mx-auto flex max-w-2xl flex-col items-center justify-center px-4 text-center text-pretty">
        <h1 className="text-4xl font-bold tracking-tight text-neutral-900">
          Discover AI Apps For Every Possible Industry & Use Case
        </h1>
        <p className="mt-4 text-lg text-pretty text-neutral-700">
          A curated directory of AI tools for every use case. Submit your app
          for free, find new users, and boost your SEO with a backlink.
        </p>
      </div>
    </div>
  );
}
