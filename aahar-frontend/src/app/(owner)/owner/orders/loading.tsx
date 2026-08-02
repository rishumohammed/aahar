export default function Loading() {
 return (
 <div className="p-8 max-w-7xl mx-auto space-y-6">
 <div className="h-12 w-64 bg-aahar-wash rounded-xl animate-pulse mb-10"/>
 <div className="grid grid-cols-4 gap-6">
 {[1,2,3,4].map(i => (
 <div key={i} className="h-96 bg-aahar-wash rounded-xl border border-aahar-border animate-pulse"/>
 ))}
 </div>
 </div>
 );
}
