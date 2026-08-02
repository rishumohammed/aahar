export default function BlogPostLoading() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-16 animate-pulse">
      <div className="h-96 w-full bg-aahar-wash rounded-xl mb-12"></div>
      <div className="h-12 w-3/4 bg-aahar-wash rounded-xl mb-6"></div>
      <div className="h-6 w-1/2 bg-aahar-wash rounded-lg mb-12"></div>
      <div className="space-y-4">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="h-4 w-full bg-aahar-wash rounded-lg"></div>
        ))}
      </div>
    </div>
  );
}
