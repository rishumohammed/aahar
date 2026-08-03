import { notFound } from "next/navigation";

// Define the expected structure from the API
type FooterLink = {
  label: string;
  type?: "url" | "page";
  url?: string;
  slug?: string;
  content?: string;
};

type FooterConfig = {
  ecosystemLinks: FooterLink[];
  companyLinks: FooterLink[];
};

const STATIC_FALLBACKS: Record<string, { label: string; content: string }> = {
  about: {
    label: "About AAHAR",
    content: `
      <h2>The Standard of Trust in Hospitality</h2>
      <p>AAHAR is India & GCC's premier independent food safety, hygiene, and accommodation quality certification authority. Founded with the mission to eliminate doubt from dining and hospitality experiences, we bridge the trust gap between conscientious consumers and quality-committed establishments.</p>
      <h3>Our Mission</h3>
      <p>We empower diners and guests with transparent, verifiable trust data while giving certified businesses the recognition they deserve through rigorous 250+ point physical and operational inspections.</p>
      <h3>Zero Tolerance Policy</h3>
      <p>Every AAHAR badge is backed by tamper-proof QR code verification and periodic unannounced audits. We uphold zero tolerance for standards fraud.</p>
    `
  },
  privacy: {
    label: "Privacy Policy",
    content: `
      <h2>Your Privacy Matters</h2>
      <p>At AAHAR, we are committed to safeguarding the privacy and personal data of our users, partner businesses, and auditor network.</p>
      <h3>Information We Collect</h3>
      <p>We only collect information necessary to deliver our discovery, certification verification, and business enquiry services. We do not sell personal data to third parties.</p>
      <h3>Data Security</h3>
      <p>All data transmitted across AAHAR is protected with industry-standard TLS encryption, strict role-based access controls, and audited cloud infrastructure.</p>
    `
  },
  terms: {
    label: "Terms of Service",
    content: `
      <h2>Terms and Conditions of Use</h2>
      <p>By accessing the AAHAR platform, directory, and verification services, you agree to comply with our standard terms of use.</p>
      <h3>Certification Display</h3>
      <p>AAHAR Trust Badges may only be displayed by active, verified partners in good standing. Misuse or unauthorized reproduction of AAHAR marks is strictly prohibited.</p>
      <h3>Directory Listings</h3>
      <p>Establishment listings are maintained for informational and consumer trust purposes. Ratings and audit reports reflect verified assessments conducted by accredited auditors.</p>
    `
  },
  security: {
    label: "Security & Fraud Prevention",
    content: `
      <h2>Trust Verification Architecture</h2>
      <p>AAHAR utilizes cryptographic verification tokens and dynamic QR codes to ensure certificate authenticity in real time.</p>
      <h3>Reporting Misuse</h3>
      <p>If you suspect an establishment is falsely displaying an AAHAR badge or misrepresenting certification status, please contact our trust and safety team immediately via our enquiry portal.</p>
    `
  }
};

export default async function CustomPage({ params }: { params: { slug: string } }) {
  const { slug } = params;

  let pageData: { label: string; content?: string } | undefined;

  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    const res = await fetch(`${baseUrl}/settings/footer_config`, {
      next: { revalidate: 60 },
    });

    if (res.ok) {
      const { data } = await res.json() as { data: FooterConfig };
      const allLinks = [...(data?.ecosystemLinks || []), ...(data?.companyLinks || [])];
      pageData = allLinks.find(link => link.type === "page" && link.slug === slug);
    }
  } catch (error) {
    // Ignore and proceed to fallback check
  }

  if (!pageData && STATIC_FALLBACKS[slug]) {
    pageData = STATIC_FALLBACKS[slug];
  }

  if (!pageData) {
    return notFound();
  }

  return (
    <main className="min-h-screen bg-aahar-wash pt-32 pb-24 px-4 sm:px-6 relative">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-aahar-teal/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-aahar-rose/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="bg-white/90 backdrop-blur-xl border border-aahar-border shadow-xl rounded-2xl p-8 md:p-16">
          <h1 className="text-4xl md:text-5xl font-black text-aahar-dark tracking-tighter mb-8 pb-8 border-b border-aahar-border/50">
            {pageData.label}
          </h1>
          
          <article 
            className="prose prose-slate max-w-none prose-headings:font-black prose-headings:tracking-tight prose-a:text-aahar-teal hover:prose-a:text-aahar-dark"
            dangerouslySetInnerHTML={{ __html: pageData.content || "No content provided." }}
          />
        </div>
      </div>
    </main>
  );
}
