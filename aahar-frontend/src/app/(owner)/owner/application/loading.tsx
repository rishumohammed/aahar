export default function Loading() {
 return (
 <div className="p-8 max-w-5xl mx-auto space-y-8 animate-pulse">
 <div className="space-y-3">
 <div className="h-10 w-80 bg-aahar-wash rounded-2xl"/>
 <div className="h-5 w-120 bg-aahar-wash rounded-xl"/>
 </div>
 <div className="space-y-4 mt-10">
 {[1, 2, 3, 4, 5].map((i) => (
 <div key={i} className="h-28 bg-aahar-wash rounded-[2rem] border border-aahar-border"/>
 ))}
 </div>
 </div>
 );
}
