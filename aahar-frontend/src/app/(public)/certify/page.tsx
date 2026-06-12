import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ShieldCheck, TrendingUp, Users, ClipboardCheck, Award, ArrowRight } from "lucide-react";
import { partnerApi } from "@/lib/api";
import { RestaurantCard } from "@/components/shared/RestaurantCard";
import { HotelCard } from "@/components/shared/HotelCard";

export default async function CertifyPage() {
  // Fetch partners for showcase
  const partnersRes = await partnerApi.list({ isFeatured: true, limit: 8 })
    .then(r => r.data?.data?.partners || [])
    .catch(() => []);

  const certifiedClients = partnersRes;

  return (
    <div className="flex flex-col min-h-screen bg-aahar-wash">
      {/* Hero Section */}
      <section className="relative w-full h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 w-full h-full">
          <Image
            src="https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=2000"
            alt="Fine dining restaurant interior"
            fill
            className="object-cover object-center"
            priority
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/30" />
        </div>

        <div className="relative container mx-auto px-6 z-10 flex flex-col md:flex-row items-center">
          <div className="max-w-3xl text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-aahar-teal/20 border border-aahar-teal/30 backdrop-blur-md mb-6">
              <ShieldCheck className="h-5 w-5 text-aahar-teal" />
              <span className="text-sm font-black uppercase tracking-widest text-white">For Business Owners</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-[1.1] mb-6 drop-shadow-lg">
              Elevate Your Trust.<br />
              <span className="text-aahar-teal">Get AAHAR Certified.</span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 font-medium mb-10 max-w-2xl leading-relaxed">
              Join the elite network of highly-rated, safety-verified restaurants and hotels. Boost your visibility, earn guest confidence, and increase your bookings today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild className="bg-aahar-teal text-white hover:bg-aahar-teal/90 rounded-2xl px-10 py-7 font-black uppercase tracking-widest text-[13px] border-0 shadow-2xl shadow-aahar-teal/20 transition-all hover:scale-105 active:scale-95">
                <Link href="/enquiry">Apply for Certification</Link>
              </Button>
              <Button asChild variant="outline" className="bg-white/10 backdrop-blur-md text-white border-white/20 hover:bg-white/20 hover:text-white rounded-2xl px-10 py-7 font-black uppercase tracking-widest text-[13px] transition-all">
                <a href="#how-it-works">See How It Works</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Stats Bar */}
      <section className="relative -mt-16 z-20 container mx-auto px-6">
        <div className="bg-white rounded-3xl shadow-2xl border border-aahar-border p-8 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-aahar-border">
            <div className="flex flex-col items-center justify-center pt-4 md:pt-0">
              <span className="text-4xl font-black text-aahar-dark mb-2">500+</span>
              <span className="text-sm font-bold uppercase tracking-widest text-aahar-body">Certified Properties</span>
            </div>
            <div className="flex flex-col items-center justify-center pt-4 md:pt-0">
              <span className="text-4xl font-black text-aahar-teal mb-2">98%</span>
              <span className="text-sm font-bold uppercase tracking-widest text-aahar-body">Guest Trust Rate</span>
            </div>
            <div className="flex flex-col items-center justify-center pt-4 md:pt-0">
              <span className="text-4xl font-black text-aahar-rose mb-2">2.5x</span>
              <span className="text-sm font-bold uppercase tracking-widest text-aahar-body">More Bookings</span>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-aahar-wash">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-aahar-dark tracking-tighter mb-4">Why Get Certified?</h2>
            <p className="text-lg text-aahar-body max-w-2xl mx-auto">
              AAHAR Certification is more than just a badge. It's a commitment to excellence that modern guests actively look for.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-10 rounded-[2.5rem] border border-aahar-border hover:shadow-xl transition-all hover:-translate-y-2 group">
              <div className="w-16 h-16 bg-aahar-teal/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp className="h-8 w-8 text-aahar-teal" />
              </div>
              <h3 className="text-2xl font-black text-aahar-dark tracking-tight mb-4">Premium Visibility</h3>
              <p className="text-aahar-body leading-relaxed">
                Certified properties are featured at the top of search results and highlighted across the AAHAR platform, driving massive organic traffic to your listing.
              </p>
            </div>
            
            <div className="bg-white p-10 rounded-[2.5rem] border border-aahar-border hover:shadow-xl transition-all hover:-translate-y-2 group">
              <div className="w-16 h-16 bg-aahar-rose/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck className="h-8 w-8 text-aahar-rose" />
              </div>
              <h3 className="text-2xl font-black text-aahar-dark tracking-tight mb-4">Unmatched Trust</h3>
              <p className="text-aahar-body leading-relaxed">
                Display the coveted AAHAR Trust Badge on your storefront and website. Guests know that a certified property guarantees hygiene, safety, and quality.
              </p>
            </div>

            <div className="bg-white p-10 rounded-[2.5rem] border border-aahar-border hover:shadow-xl transition-all hover:-translate-y-2 group">
              <div className="w-16 h-16 bg-[#F4F7F7] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="h-8 w-8 text-aahar-dark" />
              </div>
              <h3 className="text-2xl font-black text-aahar-dark tracking-tight mb-4">Actionable Insights</h3>
              <p className="text-aahar-body leading-relaxed">
                Gain access to detailed auditor feedback, hygiene scoring, and industry benchmarks to continuously improve your operations and stay ahead.
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* Process Section */}
      <section id="how-it-works" className="py-24 bg-aahar-wash border-t border-aahar-border">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-aahar-dark tracking-tighter mb-4">How It Works</h2>
            <p className="text-lg text-aahar-body max-w-2xl mx-auto">
              A transparent, rigorous, and straightforward process to elevate your business standards.
            </p>
          </div>

          <div className="relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-aahar-wash -translate-y-1/2" />
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-white border-4 border-aahar-teal text-aahar-teal rounded-full flex items-center justify-center mb-6 shadow-xl text-2xl font-black">
                  1
                </div>
                <h4 className="text-xl font-bold text-aahar-dark mb-2">Apply Online</h4>
                <p className="text-sm text-aahar-body">Submit your property details and requested documents through our secure portal.</p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-white border-4 border-aahar-teal text-aahar-teal rounded-full flex items-center justify-center mb-6 shadow-xl">
                  <ClipboardCheck className="h-8 w-8" />
                </div>
                <h4 className="text-xl font-bold text-aahar-dark mb-2">Expert Audit</h4>
                <p className="text-sm text-aahar-body">Our certified auditors visit your premises for a comprehensive 50-point inspection.</p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-white border-4 border-aahar-teal text-aahar-teal rounded-full flex items-center justify-center mb-6 shadow-xl">
                  <TrendingUp className="h-8 w-8" />
                </div>
                <h4 className="text-xl font-bold text-aahar-dark mb-2">Implement Fixes</h4>
                <p className="text-sm text-aahar-body">Receive a detailed report and implement necessary operational improvements.</p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-aahar-teal text-white rounded-full flex items-center justify-center mb-6 shadow-xl shadow-aahar-teal/30 ring-4 ring-white">
                  <Award className="h-8 w-8" />
                </div>
                <h4 className="text-xl font-bold text-aahar-dark mb-2">Get Certified</h4>
                <p className="text-sm text-aahar-body">Earn your AAHAR Trust Badge and gain immediate premium placement on our platform.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Certified Clients Showcase */}
      {certifiedClients.length > 0 && (
        <section className="py-24 bg-[#F8FAFA] border-y border-aahar-border overflow-hidden">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
              <div className="max-w-2xl">
                <div className="inline-block px-3 py-1 rounded-lg bg-aahar-teal/10 text-aahar-teal text-[10px] font-black uppercase tracking-widest mb-4">
                  Our Trusted Partners
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-aahar-dark tracking-tighter mb-4">Certified with AAHAR</h2>
                <p className="text-lg text-aahar-body">
                  We are proud to partner with these leading establishments that have met our rigorous safety and hygiene standards.
                </p>
              </div>
              <Button asChild variant="link" className="text-aahar-teal font-black p-0 group text-sm uppercase tracking-widest">
                <Link href="/search?certified=true">
                  View all members <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-12 md:gap-16">
              {certifiedClients.map((client: any, i: number) => (
                <div key={client.id || i} className="group flex flex-col items-center">
                  <div className="w-24 h-24 md:w-28 md:h-28 relative bg-white rounded-full shadow-lg border border-aahar-border overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-500 transform group-hover:scale-110 flex items-center justify-center p-4">
                    <div className="relative w-full h-full">
                      <Image
                        src={client.logo}
                        alt={client.name}
                        fill
                        className="object-cover rounded-full"
                      />
                    </div>
                  </div>
                  <span className="mt-4 text-[10px] font-black uppercase tracking-widest text-aahar-body/40 group-hover:text-aahar-teal transition-colors">
                    {client.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-24 bg-aahar-dark text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070')] opacity-10 bg-cover bg-center" />
        <div className="container mx-auto px-6 relative z-10 max-w-3xl">
          <h2 className="text-5xl font-black text-white tracking-tighter mb-6">Ready to stand out?</h2>
          <p className="text-xl text-white/70 mb-10 leading-relaxed">
            Start your certification journey today and show your guests that their safety and experience is your top priority.
          </p>
          <Button asChild className="bg-white text-aahar-dark hover:bg-gray-100 rounded-2xl px-12 py-8 font-black uppercase tracking-widest text-[14px] border-0 shadow-2xl hover:scale-105 active:scale-95 transition-all">
            <Link href="/enquiry">Begin Application Process</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
