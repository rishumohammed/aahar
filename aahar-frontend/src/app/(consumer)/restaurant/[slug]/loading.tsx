export default function RestaurantLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-white animate-pulse">
      {/* Hero Skeleton */}
      <div className="relative h-[400px] w-full bg-aahar-wash" />
      
      {/* Tabs Skeleton */}
      <div className="h-16 w-full border-b border-aahar-border bg-white" />

      {/* Content Skeleton */}
      <main className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            <div className="space-y-4">
              <div className="h-10 w-1/3 bg-aahar-wash rounded-lg" />
              <div className="h-4 w-full bg-aahar-wash rounded-md" />
              <div className="h-4 w-full bg-aahar-wash rounded-md" />
              <div className="h-4 w-2/3 bg-aahar-wash rounded-md" />
            </div>
            <div className="h-[300px] w-full bg-aahar-wash rounded-3xl" />
          </div>
          <div className="space-y-8">
            <div className="h-[400px] w-full bg-aahar-wash rounded-3xl" />
          </div>
        </div>
      </main>
    </div>
  );
}
