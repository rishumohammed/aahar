export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-aahar-wash p-4">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-aahar-teal border-t-transparent mb-4" />
      <p className="text-sm font-bold text-aahar-body/60 animate-pulse">Establishing secure connection to the kitchen...</p>
    </div>
  );
}
