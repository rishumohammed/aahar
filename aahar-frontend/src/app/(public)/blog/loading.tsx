export default function BlogLoading() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-16 animate-pulse">
      <div className="h-12 w-64 bg-aahar-wash rounded-xl mb-8"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3].map(i => (
          <div key={i} className="space-y-4">
            <div className="h-64 bg-aahar-wash rounded-[2rem]"></div>
            <div className="h-6 w-3/4 bg-aahar-wash rounded-lg"></div>
            <div className="h-4 w-full bg-aahar-wash rounded-lg"></div>
            <div className="h-4 w-1/2 bg-aahar-wash rounded-lg"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
