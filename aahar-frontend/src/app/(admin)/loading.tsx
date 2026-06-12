export default function AdminLoading() {
  return (
    <div className="p-8 space-y-8 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-10 w-48 bg-aahar-dark/10 rounded-lg" />
        <div className="h-10 w-32 bg-admin-primary/10 rounded-lg" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-white border border-aahar-border rounded-[2rem]" />
        ))}
      </div>

      <div className="h-[400px] w-full bg-white border border-aahar-border rounded-[2rem]" />
    </div>
  );
}
