import FilterBar from "@/components/shared/FilterBar";
import Link from "next/link";
import Image from "next/image";
import { RestaurantCard } from "@/components/shared/RestaurantCard";
import { HotelCard } from "@/components/shared/HotelCard";
import AdZone from "@/components/shared/AdZone";
import { MemberCountWidget } from "@/components/shared/MemberCountWidget";
import { searchApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import TrustProcess from "@/components/home/TrustProcess";
import { NearbySection } from "@/components/home/NearbySection";
import { blogApi, promotionApi } from "@/lib/api";

export const revalidate = 60; // Revalidate every 60 seconds

export default async function HomePage() {
  // Fetch featured restaurants and hotels in parallel
  const [restaurantsRes, hotelsRes, newRes, blogsRes, promotionsRes] = await Promise.allSettled([
    searchApi.search({ mode: "eat", certified: "true", limit: 6, sort: "featured" })
      .then(r => r.data.data.restaurants),
    searchApi.search({ mode: "stay", certified: "true", limit: 4, sort: "featured" })
      .then(r => r.data.data.hotels),
    searchApi.search({ mode: "both", limit: 4, sort: "newest" })
      .then(r => [...(r.data.data.restaurants || []), ...(r.data.data.hotels || [])]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 4)
      ),
    blogApi.list({ limit: 3 })
      .then(r => r.data.data),
    promotionApi.list({ isActive: true })
      .then(r => r.data.data),
  ]);

  const restaurants = restaurantsRes.status === "fulfilled" ? restaurantsRes.value : [];
  if (restaurantsRes.status === "rejected") console.error("SSR Restaurants Fetch Failed:", restaurantsRes.reason);
  const hotels      = hotelsRes.status === "fulfilled"      ? hotelsRes.value      : [];
  const newItems    = newRes.status === "fulfilled"         ? newRes.value         : [];
  const blogs       = blogsRes.status === "fulfilled"       ? (blogsRes.value.items || blogsRes.value || []) : [];
  const promotions  = promotionsRes.status === "fulfilled"  ? (promotionsRes.value || []) : [];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* ── Hero Section ── */}
      <section className="w-full bg-[#F2F4F5] relative overflow-hidden py-16 sm:py-20 md:py-24">
        <div className="container mx-auto max-w-7xl px-6 sm:px-8 text-center">
          <div className="max-w-3xl mx-auto flex flex-col items-center">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.08]">
              <span className="text-aahar-dark block">Trust every meal.</span>
              <span className="text-aahar-teal block">Verify every stay.</span>
            </h1>

            <p className="mt-5 text-base sm:text-lg text-aahar-body/80 font-normal leading-relaxed max-w-lg mx-auto">
              AAHAR helps you discover and verify trusted restaurants
              and stays — so you can focus on what matters.
            </p>

            {/* Search Bar */}
            <div className="mt-8 sm:mt-10 w-full max-w-2xl mx-auto">
              <FilterBar hideTrustStandard hideMoreFilters hideReset hideLabels />
            </div>
          </div>
        </div>
      </section>


      {/* Stats/Trust Bar */}
      <div className="bg-white border-b border-aahar-border">
        <div className="container mx-auto max-w-7xl px-4 py-6 sm:py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {/* Card 1: Members */}
            <MemberCountWidget />

            {/* Card 2: Audited */}
            <div className="rounded-xl bg-white p-6 shadow-sm border border-aahar-border hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-aahar-teal/10 text-aahar-teal">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-extrabold text-aahar-dark tracking-tight">100% Audited</div>
                  <div className="text-xs font-semibold text-aahar-body/70">Manual Verification Process</div>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-aahar-wash p-3 text-[10px] font-black text-aahar-teal uppercase tracking-widest">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                Zero Tolerance for Fraud
              </div>
            </div>

            {/* Card 3: Region */}
            <div className="rounded-xl bg-white p-6 shadow-sm border border-aahar-border hover:shadow-md hover:-translate-y-1 transition-all duration-300 sm:col-span-2 md:col-span-1">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-aahar-rose/10 text-aahar-rose">
                  <ArrowRight className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-extrabold text-aahar-dark tracking-tight">India & GCC</div>
                  <div className="text-xs font-semibold text-aahar-body/70">Regional Trust Authority</div>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-aahar-wash p-3 text-[10px] font-black text-aahar-rose uppercase tracking-widest">
                <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                Expanding Trust Networks
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 1: Discovery Directory (White Background) */}
      <div className="bg-white">
        <div className="container mx-auto max-w-7xl px-4 py-12 sm:py-16 space-y-12 sm:space-y-16">
          <section id="discovery" className="space-y-12">
            {/* Featured Restaurants */}
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-l-4 border-aahar-teal pl-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-aahar-dark tracking-tight">Certified Restaurants</h2>
                  <p className="text-xs sm:text-sm font-medium text-aahar-body/80">Top-rated certified dining experiences</p>
                </div>
                <Link href="/search?mode=eat" className="shrink-0">
                  <Button variant="link" className="text-aahar-teal font-black text-xs uppercase tracking-wider p-0 group">
                    View all <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {restaurants.map((r: any) => (
                  <RestaurantCard key={r.id} restaurant={r} />
                ))}
              </div>
            </div>

            {/* AdZone Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <AdZone size="fluid" label="SPONSORED" className="h-[200px] sm:h-[250px] md:col-span-3" promotion={promotions.find((p: any) => p.position === 'fluid')} />
              <AdZone size="300x250" label="PROMOTION" className="h-[200px] sm:h-[250px] w-full" promotion={promotions.find((p: any) => p.position === '300x250')} />
            </div>

            {/* Certified Hotels */}
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-l-4 border-aahar-rose pl-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-aahar-dark tracking-tight">Certified Hotels & Resorts</h2>
                  <p className="text-xs sm:text-sm font-medium text-aahar-body/80">Verified stays across the region</p>
                </div>
                <Link href="/search?mode=stay" className="shrink-0">
                  <Button variant="link" className="text-aahar-teal font-black text-xs uppercase tracking-wider p-0 group">
                    Explore all <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
              <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 no-scrollbar scroll-smooth snap-x snap-mandatory">
                {hotels.map((h: any) => (
                  <HotelCard key={h.id} hotel={h} className="w-[260px] sm:w-[320px] shrink-0 snap-start" />
                ))}
              </div>
            </div>

            {/* New Discoveries */}
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-l-4 border-aahar-dark pl-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-aahar-dark tracking-tight">New Discoveries</h2>
                  <p className="text-xs sm:text-sm font-medium text-aahar-body/80">Recently added establishments joining the trust network</p>
                </div>
                <Link href="/search" className="shrink-0">
                  <Button variant="link" className="text-aahar-body font-black text-xs uppercase tracking-wider p-0 group">
                    See all new <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {newItems.map((item: any) => (
                  item.propertyType ? (
                    <HotelCard key={item.id} hotel={item} />
                  ) : (
                    <RestaurantCard key={item.id} restaurant={item} />
                  )
                ))}
              </div>
            </div>

            {/* Location-based Nearby Sections */}
            <NearbySection />

          </section>
        </div>
      </div>

      {/* Section 2: Certification Details (New Animated Component) */}
      <div id="trust">
        <TrustProcess />
      </div>

      {/* Section 3: Latest from the Blog */}
      <div className="bg-aahar-wash/30 py-12 sm:py-16 md:py-20 border-t border-aahar-border">
        <div className="container mx-auto max-w-7xl px-4 space-y-10 sm:space-y-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-l-4 border-aahar-teal pl-4 sm:pl-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-aahar-dark tracking-tight">Latest from the Blog</h2>
              <p className="text-xs sm:text-sm text-aahar-body/80 font-medium">Insights, guides, and stories from the trust network</p>
            </div>
            <Link href="/blog" className="shrink-0">
              <Button variant="link" className="text-aahar-teal font-black uppercase tracking-widest text-[10px] sm:text-xs p-0 group">
                Visit Blog <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10">
            {blogs.slice(0, 3).map((blog: any) => (
              <Link key={blog.id} href={`/blog/${blog.slug}`} className="group space-y-4 sm:space-y-6">
                <div className="relative aspect-[16/10] rounded-xl overflow-hidden shadow-xl shadow-aahar-teal/5 border border-aahar-border/50">
                  <Image 
                    src={blog.coverImage} 
                    alt={blog.title} 
                    fill 
                    className="object-cover transition-transform duration-700 group-hover:scale-110" 
                  />
                  <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
                    <Badge className="bg-white/90 backdrop-blur-md text-aahar-teal hover:bg-white text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border-0 shadow-lg">
                      {blog.category.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2.5 px-1">
                  <h3 className="text-lg sm:text-xl font-bold text-aahar-dark group-hover:text-aahar-teal transition-all duration-300 line-clamp-2 leading-tight">
                    {blog.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-aahar-body/70 line-clamp-2 font-medium leading-relaxed">
                    {blog.excerpt}
                  </p>
                  <div className="pt-1 flex items-center text-[10px] font-black uppercase tracking-widest text-aahar-teal group-hover:translate-x-1 transition-all duration-300">
                    Read Story <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Strip - Full Width */}
      <section className="w-full bg-gradient-to-r from-aahar-teal via-[#0B8585] to-aahar-dark py-12 sm:py-16 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-12 max-w-5xl mx-auto">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white text-center md:text-left leading-tight tracking-tight">
              Grow your trust with AAHAR. <br className="hidden md:block"/>
              Join our certified network today.
            </h3>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto shrink-0">
              <Button asChild className="bg-white text-aahar-teal hover:bg-white/90 rounded-xl h-14 px-8 font-black uppercase tracking-wider text-xs shadow-xl transition-all hover:scale-105 active:scale-95">
                <Link href="/enquiry">List your restaurant / hotel</Link>
              </Button>
              <Button asChild className="bg-aahar-rose text-white hover:bg-aahar-rose/90 rounded-xl h-14 px-8 font-black uppercase tracking-wider text-xs border-0 shadow-xl shadow-aahar-rose/30 transition-all hover:scale-105 active:scale-95">
                <Link href="/enquiry">Get AAHAR certified</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
