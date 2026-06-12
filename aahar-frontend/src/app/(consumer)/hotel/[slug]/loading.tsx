export default function HotelLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-white animate-pulse">
      {/* Hero Skeleton */}
      <div className="relative h-[570px] w-full bg-aahar-wash" />
      
      {/* Tabs Skeleton */}
      <div className="h-16 w-full border-b border-aahar-border bg-white shadow-sm" />

      {/* Content Skeleton */}
      <main className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2 space-y-16">
            <div className="space-y-6">
              <div className="flex gap-2">
                {[1,2,3,4].map(i => <div key={i} className="h-8 w-24 bg-aahar-wash rounded-full" />)}
              </div>
              <div className="h-6 w-full bg-aahar-wash rounded-md" />
              <div className="h-6 w-full bg-aahar-wash rounded-md" />
              <div className="h-6 w-2/3 bg-aahar-wash rounded-md" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[1,2].map(i => <div key={i} className="h-[400px] w-full bg-aahar-wash rounded-[2.5rem]" />)}
            </div>
          </div>
          <div className="space-y-10">
            <div className="h-[500px] w-full bg-aahar-wash rounded-3xl" />
          </div>
        </div>
      </main>
    </div>
  );
}
