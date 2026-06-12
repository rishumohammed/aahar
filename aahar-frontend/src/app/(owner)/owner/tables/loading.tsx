export default function Loading() {
 return (
 <div className="p-8 max-w-5xl mx-auto space-y-6">
 <div className="h-12 w-64 bg-aahar-wash rounded-2xl animate-pulse mb-10"/>
 <div className="grid grid-cols-3 gap-6">
 {[1,2,3].map(i => (
 <div key={i} className="h-72 bg-aahar-wash rounded-3xl border border-aahar-border animate-pulse"/>
 ))}
 </div>
 </div>
 );
}
