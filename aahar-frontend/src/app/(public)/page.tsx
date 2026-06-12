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
import { blogApi } from "@/lib/api";

export default async function HomePage() {
  // Fetch featured restaurants and hotels in parallel
  const [restaurantsRes, hotelsRes, newRes, blogsRes] = await Promise.allSettled([
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
  ]);

  const restaurants = restaurantsRes.status === "fulfilled" ? restaurantsRes.value : [];
  const hotels      = hotelsRes.status === "fulfilled"      ? hotelsRes.value      : [];
  const newItems    = newRes.status === "fulfilled"         ? newRes.value         : [];
  const blogs       = blogsRes.status === "fulfilled"       ? (blogsRes.value as any) : [];

  return (
    <div className="flex flex-col min-h-screen bg-aahar-wash">
      {/* Hero Section (Part of Discovery Zone) */}
      <section className="w-full py-20 bg-[#F4F7F7]">
        <div className="container mx-auto max-w-7xl px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-7xl font-bold tracking-tight leading-tight">
              <span className="text-[#1A2E2E] block">
                Trust every meal.
              </span>
              <span className="text-aahar-teal block">
                Verify every stay.
              </span>
            </h1>
            
            <div className="mt-12 max-w-5xl mx-auto">
              <FilterBar hideTrustStandard hideMoreFilters hideReset hideLabels />
            </div>
          </div>
        </div>
      </section>

      {/* Stats/Trust Bar */}
      <div className="bg-white border-b border-aahar-border">
        <div className="container mx-auto max-w-7xl px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Members */}
            <MemberCountWidget />

            {/* Card 2: Audited */}
            <div className="rounded-3xl bg-white p-6 shadow-sm border border-aahar-border">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-aahar-teal/10 text-aahar-teal">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xl font-bold text-aahar-dark">100% Audited</div>
                  <div className="text-xs font-medium text-aahar-body">Manual Verification Process</div>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-aahar-wash p-3 text-[10px] font-bold text-aahar-teal uppercase tracking-wider">
                <CheckCircle2 className="h-3 w-3" />
                Zero Tolerance for Fraud
              </div>
            </div>

            {/* Card 3: Region */}
            <div className="rounded-3xl bg-white p-6 shadow-sm border border-aahar-border">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-aahar-rose/10 text-aahar-rose">
                  <ArrowRight className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-aahar-dark">India & GCC</div>
                  <div className="text-xs font-medium text-aahar-body">Regional Trust Authority</div>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-aahar-wash p-3 text-[10px] font-bold text-aahar-rose uppercase tracking-wider">
                <ArrowRight className="h-3 w-3" />
                Expanding Trust Networks
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 1: Discovery Directory (White Background) */}
      <div className="bg-white">
        <div className="container mx-auto max-w-7xl px-4 py-16 space-y-16">
          <section id="discovery" className="space-y-12">
            {/* Featured Restaurants */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-l-4 border-aahar-teal pl-4">
                <div>
                  <h2 className="text-2xl font-bold text-aahar-dark">Certified Restaurants</h2>
                  <p className="text-sm text-aahar-body">Top-rated certified dining experiences</p>
                </div>
                <Link href="/search?mode=eat">
                  <Button variant="link" className="text-aahar-teal font-bold p-0 group">
                    View all <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {restaurants.map((r: any) => (
                  <RestaurantCard key={r.id} restaurant={r} />
                ))}
              </div>
            </div>

            {/* AdZone Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <AdZone size="fluid" label="SPONSORED" className="h-32 md:col-span-3" />
              <AdZone size="300x250" label="PROMOTION" className="h-32 w-full" />
            </div>

            {/* Certified Hotels */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-l-4 border-aahar-rose pl-4">
                <div>
                  <h2 className="text-2xl font-bold text-aahar-dark">Certified Hotels & Resorts</h2>
                  <p className="text-sm text-aahar-body">Verified stays across the region</p>
                </div>
                <Link href="/search?mode=stay">
                  <Button variant="link" className="text-aahar-teal font-bold p-0 group">
                    Explore all <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
              <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar scroll-smooth">
                {hotels.map((h: any) => (
                  <HotelCard key={h.id} hotel={h} className="w-[280px] sm:w-[320px] shrink-0" />
                ))}
              </div>
            </div>

            {/* New Discoveries */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-l-4 border-aahar-dark pl-4">
                <div>
                  <h2 className="text-2xl font-bold text-aahar-dark">New Discoveries</h2>
                  <p className="text-sm text-aahar-body">Recently added establishments joining the trust network</p>
                </div>
                <Link href="/search">
                  <Button variant="link" className="text-aahar-body font-bold p-0 group">
                    See all new <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
      <div className="bg-aahar-wash/30 py-20 border-t border-aahar-border">
        <div className="container mx-auto max-w-7xl px-4 space-y-12">
          <div className="flex items-center justify-between border-l-4 border-aahar-teal pl-6">
            <div>
              <h2 className="text-3xl font-bold text-aahar-dark tracking-tight">Latest from the Blog</h2>
              <p className="text-aahar-body font-medium">Insights, guides, and stories from the trust network</p>
            </div>
            <Link href="/blog">
              <Button variant="link" className="text-aahar-teal font-black uppercase tracking-widest text-[10px] p-0 group">
                Visit Blog <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {blogs.slice(0, 3).map((blog: any) => (
              <Link key={blog.id} href={`/blog/${blog.slug}`} className="group space-y-6">
                <div className="relative aspect-[16/10] rounded-[2.5rem] overflow-hidden shadow-xl shadow-aahar-teal/5">
                  <Image 
                    src={blog.coverImage} 
                    alt={blog.title} 
                    fill 
                    className="object-cover transition-transform duration-700 group-hover:scale-110" 
                  />
                  <div className="absolute top-6 left-6">
                    <Badge className="bg-white/90 backdrop-blur-md text-aahar-teal hover:bg-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border-0 shadow-lg">
                      {blog.category.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-3 px-2">
                  <h3 className="text-xl font-bold text-aahar-dark group-hover:text-aahar-teal transition-all duration-300 line-clamp-2 leading-tight">
                    {blog.title}
                  </h3>
                  <p className="text-sm text-aahar-body/70 line-clamp-2 font-medium leading-relaxed">
                    {blog.excerpt}
                  </p>
                  <div className="pt-2 flex items-center text-[10px] font-black uppercase tracking-widest text-aahar-teal opacity-0 group-hover:opacity-100 transition-all duration-300">
                    Read Story <ArrowRight className="ml-2 h-3 w-3" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Strip (10%) - Full Width */}
      <section className="w-full bg-aahar-teal py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
            <h3 className="text-2xl font-bold text-white text-center md:text-left">
              Grow your trust with AAHAR <br className="hidden md:block"/>
              Join our certified network today.
            </h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild className="bg-white text-aahar-teal hover:bg-white/90 rounded-full px-8 font-bold">
                <Link href="/enquiry?type=restaurant">List your restaurant</Link>
              </Button>
              <Button asChild className="bg-white text-aahar-teal hover:bg-white/90 rounded-full px-8 font-bold">
                <Link href="/enquiry?type=hotel">List your hotel/resort</Link>
              </Button>
              <Button asChild className="bg-aahar-rose text-white hover:bg-aahar-rose/90 rounded-full px-8 font-bold border-0 shadow-lg shadow-aahar-rose/20">
                <Link href="/enquiry">Get AAHAR certified</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
