import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ShieldCheck, TrendingUp, Users, ClipboardCheck, Award, ArrowRight, Building2 } from "lucide-react";
import { partnerApi } from "@/lib/api";

export default async function CertifyPage() {
  // Fetch partners for showcase
  const partnersRes = await partnerApi.list({ isFeatured: true, limit: 8 })
    .then(r => r.data?.data?.partners || [])
    .catch(() => []);

  const certifiedClients = partnersRes;

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* ── Hero Section ── */}
      <section className="w-full bg-[#F2F4F5] relative overflow-hidden py-16 sm:py-20 md:py-24 border-b border-aahar-border/60">
        {/* Subtle Ambient Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none -z-0">
          <div className="absolute top-[-10%] right-[10%] w-[450px] h-[450px] bg-aahar-teal/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-10%] left-[10%] w-[350px] h-[350px] bg-aahar-rose/5 rounded-full blur-[80px]" />
        </div>

        <div className="container mx-auto max-w-7xl px-6 sm:px-8 text-center relative z-10">
          <div className="max-w-3xl mx-auto flex flex-col items-center">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-aahar-border shadow-sm mb-6">
              <ShieldCheck className="h-4 w-4 text-aahar-teal" />
              <span className="text-[11px] font-black uppercase tracking-widest text-aahar-teal">For Business Owners</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08]">
              <span className="text-aahar-dark block">Elevate Your Trust.</span>
              <span className="text-aahar-teal block">Get AAHAR Certified.</span>
            </h1>

            {/* Subtitle */}
            <p className="mt-5 text-base sm:text-lg text-aahar-body/80 font-normal leading-relaxed max-w-xl mx-auto">
              Get your restaurant or hotel evaluated against comprehensive safety & hygiene benchmarks. Build authentic guest trust and stand out with verified recognition.
            </p>

            {/* Action Buttons */}
            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild className="bg-aahar-teal text-white hover:bg-aahar-teal/90 rounded-xl h-14 px-8 font-black uppercase tracking-wider text-xs border-0 shadow-xl shadow-aahar-teal/20 transition-all hover:scale-105 active:scale-95">
                <Link href="/enquiry">Apply for Certification</Link>
              </Button>
              <Button asChild variant="outline" className="bg-white hover:bg-aahar-wash text-aahar-dark hover:text-aahar-dark border border-aahar-border rounded-xl h-14 px-8 font-black uppercase tracking-wider text-xs shadow-sm transition-all hover:border-aahar-dark hover:shadow-md">
                <a href="#how-it-works">See How It Works</a>
              </Button>
            </div>
          </div>

          {/* Trust Standards Highlights */}
          <div className="mt-14 sm:mt-16 max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-aahar-border p-6 sm:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center divide-y sm:divide-y-0 sm:divide-x divide-aahar-border">
              <div className="flex flex-col items-center justify-center pt-3 sm:pt-0">
                <span className="text-3xl sm:text-4xl font-extrabold text-aahar-dark mb-1">250+</span>
                <span className="text-xs font-bold uppercase tracking-wider text-aahar-body/80">Audit Checkpoints</span>
              </div>
              <div className="flex flex-col items-center justify-center pt-3 sm:pt-0">
                <span className="text-3xl sm:text-4xl font-extrabold text-aahar-teal mb-1">100%</span>
                <span className="text-xs font-bold uppercase tracking-wider text-aahar-body/80">Physical Verification</span>
              </div>
              <div className="flex flex-col items-center justify-center pt-3 sm:pt-0">
                <span className="text-3xl sm:text-4xl font-extrabold text-aahar-rose mb-1">Live QR</span>
                <span className="text-xs font-bold uppercase tracking-wider text-aahar-body/80">Instant Verification</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 sm:py-24 bg-white">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-aahar-dark tracking-tight mb-4">Why Get Certified?</h2>
            <p className="text-base sm:text-lg text-aahar-body/80 max-w-2xl mx-auto">
              AAHAR Certification is more than just a badge. It's a commitment to excellence that modern guests actively look for.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-aahar-wash/40 p-8 sm:p-10 rounded-2xl border border-aahar-border hover:shadow-xl transition-all hover:-translate-y-1 group">
              <div className="w-14 h-14 bg-aahar-teal/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp className="h-7 w-7 text-aahar-teal" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-aahar-dark tracking-tight mb-3">Premium Visibility</h3>
              <p className="text-sm sm:text-base text-aahar-body/80 leading-relaxed">
                Certified properties are featured at the top of search results and highlighted across the AAHAR platform, driving massive organic traffic to your listing.
              </p>
            </div>
            
            <div className="bg-aahar-wash/40 p-8 sm:p-10 rounded-2xl border border-aahar-border hover:shadow-xl transition-all hover:-translate-y-1 group">
              <div className="w-14 h-14 bg-aahar-rose/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck className="h-7 w-7 text-aahar-rose" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-aahar-dark tracking-tight mb-3">Unmatched Trust</h3>
              <p className="text-sm sm:text-base text-aahar-body/80 leading-relaxed">
                Display the coveted AAHAR Trust Badge on your storefront and website. Guests know that a certified property guarantees hygiene, safety, and quality.
              </p>
            </div>

            <div className="bg-aahar-wash/40 p-8 sm:p-10 rounded-2xl border border-aahar-border hover:shadow-xl transition-all hover:-translate-y-1 group">
              <div className="w-14 h-14 bg-aahar-wash rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-aahar-border">
                <Users className="h-7 w-7 text-aahar-dark" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-aahar-dark tracking-tight mb-3">Actionable Insights</h3>
              <p className="text-sm sm:text-base text-aahar-body/80 leading-relaxed">
                Gain access to detailed auditor feedback, hygiene scoring, and industry benchmarks to continuously improve your operations and stay ahead.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section id="how-it-works" className="py-20 sm:py-24 bg-aahar-wash/50 border-t border-aahar-border">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-aahar-dark tracking-tighter mb-4">How It Works</h2>
            <p className="text-lg text-aahar-body max-w-2xl mx-auto">
              A transparent, rigorous, and straightforward 250+ point evaluation process to elevate your business standards.
            </p>
          </div>

          <div className="relative">
            {/* Connecting Line positioned behind badges */}
            <div className="hidden md:block absolute top-10 left-12 right-12 h-0.5 border-t-2 border-dashed border-aahar-teal/30 -z-0" />
            
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
                <p className="text-sm text-aahar-body">Our certified auditors visit your premises for a comprehensive 250+ point inspection.</p>
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
        <section className="py-24 bg-white border-y border-aahar-border overflow-hidden">
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
                    {client.logo ? (
                      <div className="relative w-full h-full">
                        <Image
                          src={client.logo}
                          alt={client.name}
                          fill
                          className="object-cover rounded-full"
                        />
                      </div>
                    ) : (
                      <Building2 className="w-10 h-10 text-aahar-body/40 group-hover:text-aahar-teal transition-colors" />
                    )}
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

      {/* ── Modern Bottom CTA Section ── */}
      <section className="py-16 sm:py-24 bg-aahar-wash/40 border-t border-aahar-border relative overflow-hidden">
        {/* Subtle Ambient Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl h-full pointer-events-none -z-0">
          <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-aahar-teal/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-aahar-rose/5 rounded-full blur-[100px]" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 max-w-6xl relative z-10">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-aahar-border/30 bg-aahar-dark">
            {/* Background Image with curated rich gradient overlay */}
            <div className="absolute inset-0 z-0">
              <Image
                src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070"
                alt="Hospitality excellence"
                fill
                className="object-cover object-center opacity-30"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-aahar-dark via-aahar-dark/95 to-aahar-teal/40" />
            </div>

            {/* Content Container */}
            <div className="relative z-10 p-8 sm:p-12 md:p-16 lg:p-20 text-white">
              <div className="max-w-2xl space-y-6">
                {/* Pill Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-sm">
                  <ShieldCheck className="h-4 w-4 text-aahar-teal" />
                  <span className="text-[11px] font-black uppercase tracking-widest text-white">Certification Process</span>
                </div>

                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.15]">
                  Ready to stand out with verified trust?
                </h2>

                <p className="text-base sm:text-lg text-white/80 font-normal leading-relaxed">
                  Start your certification journey today. Show your guests that food safety, hygiene, and exceptional standards are your top priority.
                </p>

                {/* Standard Guarantees */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="flex items-center gap-2.5 text-xs font-bold text-white/90">
                    <CheckCircle2 className="h-4 w-4 text-aahar-teal shrink-0" />
                    <span>250+ Point In-Person Inspection</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs font-bold text-white/90">
                    <CheckCircle2 className="h-4 w-4 text-aahar-teal shrink-0" />
                    <span>Official Trust Badge & Certificate</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs font-bold text-white/90">
                    <CheckCircle2 className="h-4 w-4 text-aahar-teal shrink-0" />
                    <span>Instant Public QR Verification</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs font-bold text-white/90">
                    <CheckCircle2 className="h-4 w-4 text-aahar-teal shrink-0" />
                    <span>Premium Directory Placement</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                  <Button asChild className="bg-aahar-teal text-white hover:bg-aahar-teal/90 rounded-xl h-14 px-8 font-black uppercase tracking-wider text-xs border-0 shadow-xl shadow-aahar-teal/30 transition-all hover:scale-105 active:scale-95">
                    <Link href="/enquiry">Begin Application Process</Link>
                  </Button>
                  <Button asChild variant="outline" className="bg-white/10 hover:bg-white/20 text-white hover:text-white backdrop-blur-md border border-white/20 rounded-xl h-14 px-8 font-black uppercase tracking-wider text-xs transition-all hover:border-white/40">
                    <Link href="/verify">Verify Existing Certificate</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
