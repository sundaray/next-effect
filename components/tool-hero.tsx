export function ToolHero() {
  return (
    <div className="w-full h-100 overflow-hidden relative">
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
      <div className="text-center text-pretty mx-auto px-4 z-10 max-w-2xl absolute inset-0 flex flex-col items-center justify-center">
        <h1 className="text-4xl tracking-tight font-bold text-neutral-900">
          Discover AI Apps For Every Possible Industry & Use Case
        </h1>
      </div>
    </div>
  );
}
