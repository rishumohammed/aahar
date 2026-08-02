export default function Loading() {
 return (
 <div className="p-8 max-w-5xl mx-auto space-y-8 animate-pulse">
 <div className="flex justify-between items-center">
 <div className="space-y-3">
 <div className="h-10 w-80 bg-aahar-wash rounded-xl"/>
 <div className="h-5 w-120 bg-aahar-wash rounded-xl"/>
 </div>
 <div className="h-12 w-40 bg-aahar-wash rounded-xl"/>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-10">
 <div className="md:col-span-3 space-y-6">
 <div className="h-48 bg-aahar-wash rounded-xl border border-aahar-border"/>
 <div className="h-80 bg-aahar-wash rounded-xl border border-aahar-border"/>
 </div>
 <div className="space-y-6">
 <div className="h-64 bg-aahar-wash rounded-xl border border-aahar-border"/>
 <div className="h-48 bg-aahar-wash rounded-xl border border-aahar-border"/>
 </div>
 </div>
 </div>
 );
}
