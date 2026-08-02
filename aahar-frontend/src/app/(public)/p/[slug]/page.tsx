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

export const revalidate = 60; // Revalidate every 60 seconds

export default async function CustomPage({ params }: { params: { slug: string } }) {
  const { slug } = params;

  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    const res = await fetch(`${baseUrl}/settings/footer_config`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return notFound();
    }

    const { data } = await res.json() as { data: FooterConfig };

    // Search both ecosystem and company links for the matching slug
    const allLinks = [...(data?.ecosystemLinks || []), ...(data?.companyLinks || [])];
    const pageData = allLinks.find(link => link.type === "page" && link.slug === slug);

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
          <div className="bg-white/80 backdrop-blur-xl border border-aahar-border shadow-xl rounded-xl p-8 md:p-16">
            <h1 className="text-4xl md:text-5xl font-black text-aahar-dark tracking-tighter mb-8 pb-8 border-b border-aahar-wash">
              {pageData.label}
            </h1>
            
            {/* 
              Using prose from tailwindcss/typography to format the rich text.
              This perfectly handles HTML elements like headings, paragraphs, and lists.
            */}
            <article 
              className="prose prose-slate max-w-none prose-headings:font-black prose-headings:tracking-tight prose-a:text-aahar-teal hover:prose-a:text-aahar-dark"
              dangerouslySetInnerHTML={{ __html: pageData.content || "No content provided." }}
            />
          </div>
        </div>
      </main>
    );

  } catch (error) {
    console.error("Failed to load custom page:", error);
    return notFound();
  }
}
