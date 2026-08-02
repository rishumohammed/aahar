export default function PublicLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-aahar-wash animate-pulse">
      {/* Hero Skeleton */}
      <section className="w-full py-20 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="h-8 w-48 bg-aahar-rose/20 rounded-full mx-auto" />
          <div className="space-y-4">
            <div className="h-16 w-3/4 bg-aahar-dark/10 rounded-xl mx-auto" />
            <div className="h-16 w-1/2 bg-aahar-rose/10 rounded-xl mx-auto" />
          </div>
          <div className="h-6 w-full bg-aahar-body/10 rounded-md mx-auto" />
          <div className="h-14 w-full max-w-2xl bg-white rounded-xl mx-auto border border-aahar-border" />
        </div>
      </section>

      {/* Content Skeleton */}
      <div className="container mx-auto max-w-7xl px-4 py-16 space-y-20">
        <div className="space-y-8">
          <div className="h-10 w-64 bg-aahar-dark/10 rounded-lg" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-[350px] bg-white rounded-xl border border-aahar-border" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
