export function CategoryButtonsSkeleton({ count = 6 }: { count?: number }) {
  const widths = ["w-20", "w-24", "w-16", "w-28", "w-14", "w-24", "w-20", "w-32"]
  return (
    <div
      className="flex flex-wrap gap-2 justify-end animate-pulse"
      aria-label="Loading categories"
      aria-busy="true"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`h-8 rounded-full ${widths[i % widths.length]} bg-white`}
        />
      ))}
    </div>
  )
}