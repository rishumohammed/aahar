export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 border-4 border-aahar-teal/20 rounded-full" />
        <div className="absolute inset-0 border-4 border-aahar-teal border-t-transparent rounded-full animate-spin" />
      </div>
      <div className="text-aahar-teal font-bold tracking-widest text-sm animate-pulse uppercase">Loading registration...</div>
    </div>
  );
}
