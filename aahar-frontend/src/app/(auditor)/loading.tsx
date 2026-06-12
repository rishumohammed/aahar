export default function AuditorLoading() {
  return (
    <div className="p-8 space-y-8 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-10 w-48 bg-slate-200 rounded-lg" />
        <div className="h-10 w-32 bg-admin-primary/10 rounded-lg" />
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 bg-white border border-slate-200 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
