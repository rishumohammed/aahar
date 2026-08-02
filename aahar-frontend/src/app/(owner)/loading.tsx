export default function OwnerLoading() {
 return (
 <div className="p-8 space-y-8 animate-pulse">
 <div className="flex items-center justify-between">
 <div className="h-10 w-48 bg-aahar-dark/10 rounded-lg"/>
 <div className="h-10 w-32 bg-aahar-rose/10 rounded-lg"/>
 </div>
 
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 {[1, 2, 3].map((i) => (
 <div key={i} className="h-40 bg-white border border-aahar-border rounded-xl"/>
 ))}
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
 <div className="h-[300px] bg-white border border-aahar-border rounded-xl"/>
 <div className="h-[300px] bg-white border border-aahar-border rounded-xl"/>
 </div>
 </div>
 );
}
