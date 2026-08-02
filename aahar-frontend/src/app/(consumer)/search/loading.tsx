export default function SearchLoading() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-12 space-y-12 animate-pulse">
      {/* Search Header Skeleton */}
      <div className="space-y-10">
        <div className="text-center md:text-left space-y-4">
          <div className="h-12 w-3/4 md:w-1/2 bg-aahar-dark/10 rounded-xl" />
          <div className="h-6 w-1/3 bg-aahar-body/10 rounded-md" />
        </div>

        {/* Filter Bar Skeleton */}
        <div className="h-20 w-full bg-white rounded-xl border border-aahar-border shadow-sm" />
      </div>

      {/* Results Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="space-y-4">
            <div className="aspect-[4/5] bg-white border-2 border-aahar-border rounded-xl" />
            <div className="space-y-2 px-2">
              <div className="h-5 w-3/4 bg-aahar-dark/10 rounded-md" />
              <div className="h-4 w-1/2 bg-aahar-body/10 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
