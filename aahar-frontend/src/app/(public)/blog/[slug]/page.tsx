import { blogApi } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";
import { BlogPost } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, ArrowLeft, Share2, Bookmark } from "lucide-react";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const res = await blogApi.get(slug);
  const blog: BlogPost | null = res.data.data;

  if (!blog) {
    notFound();
  }

  return (
    <article className="flex flex-col min-h-screen bg-white pb-24">
      {/* Article Header */}
      <header className="relative pt-12 pb-20">
        <div className="container mx-auto max-w-4xl px-4">
          <Link 
            href="/blog" 
            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-aahar-body/40 hover:text-aahar-teal transition-colors mb-12 group"
          >
            <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-1" />
            Back to Insights
          </Link>

          <div className="space-y-6">
            <Badge className="bg-aahar-teal/10 text-aahar-teal hover:bg-aahar-teal/20 text-[10px] font-black uppercase tracking-widest px-5 py-2.5 rounded-xl border-0">
              {blog.category.replace('_', ' ')}
            </Badge>

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-aahar-dark tracking-tight leading-[1.1] max-w-4xl">
              {blog.title}
            </h1>

            <div className="flex flex-wrap items-center gap-8 pt-4">
              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="relative w-12 h-12 rounded-2xl overflow-hidden border-2 border-aahar-wash shadow-sm">
                  <Image src={blog.author.avatar || ""} alt={blog.author.name} fill className="object-cover" />
                </div>
                <div>
                  <div className="text-sm font-bold text-aahar-dark">{blog.author.name}</div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-aahar-body/40">{blog.author.role}</div>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 border-l border-aahar-wash pl-8">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-aahar-body/40" />
                  <span className="text-xs font-medium text-aahar-body">
                    {new Date(blog.publishedAt).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-aahar-body/40" />
                  <span className="text-xs font-medium text-aahar-body">{blog.readingTime}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Featured Image */}
      <div className="container mx-auto max-w-5xl px-4">
        <div className="relative aspect-[21/9] rounded-[3.5rem] overflow-hidden shadow-2xl shadow-aahar-teal/5 border border-aahar-wash">
          <Image
            src={blog.coverImage}
            alt={blog.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>

      {/* Article Content */}
      <div className="container mx-auto max-w-7xl px-4 mt-20 flex flex-col lg:flex-row gap-16">
        {/* Sidebar Actions */}
        <aside className="lg:w-20 flex lg:flex-col items-center gap-6 lg:sticky lg:top-32 h-fit">
          <button className="w-12 h-12 rounded-2xl bg-white border border-aahar-wash flex items-center justify-center text-aahar-body hover:text-aahar-teal hover:border-aahar-teal hover:bg-aahar-teal/5 transition-all group">
            <Share2 className="h-5 w-5 transition-transform group-hover:scale-110" />
          </button>
          <button className="w-12 h-12 rounded-2xl bg-white border border-aahar-wash flex items-center justify-center text-aahar-body hover:text-aahar-teal hover:border-aahar-teal hover:bg-aahar-teal/5 transition-all group">
            <Bookmark className="h-5 w-5 transition-transform group-hover:scale-110" />
          </button>
        </aside>

        {/* Content Body */}
        <div className="flex-grow max-w-3xl">
          <div 
            className="prose prose-lg prose-aahar max-w-none 
              prose-headings:text-aahar-dark prose-headings:font-bold prose-headings:tracking-tight
              prose-p:text-aahar-body/80 prose-p:leading-relaxed prose-p:font-medium
              prose-blockquote:border-l-4 prose-blockquote:border-aahar-teal prose-blockquote:bg-aahar-teal/5 prose-blockquote:px-8 prose-blockquote:py-4 prose-blockquote:rounded-r-2xl prose-blockquote:italic prose-blockquote:text-aahar-teal
              prose-img:rounded-[2rem]
              prose-strong:text-aahar-dark prose-strong:font-bold"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />

          {/* Tags */}
          <div className="mt-16 pt-12 border-t border-aahar-wash flex flex-wrap gap-3">
            {blog.tags.map(tag => (
              <span key={tag} className="px-5 py-2 bg-aahar-wash text-aahar-body text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-aahar-teal hover:text-white transition-colors cursor-pointer">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Author Bio (Optional Sidebar) */}
        <aside className="hidden xl:block w-80 space-y-10 sticky top-32 h-fit">
          <div className="p-8 bg-aahar-wash/50 rounded-[2.5rem] border border-aahar-wash">
            <h3 className="text-xs font-black uppercase tracking-widest text-aahar-dark mb-6">About the Author</h3>
            <div className="space-y-4">
              <div className="relative w-16 h-16 rounded-[1.25rem] overflow-hidden">
                <Image src={blog.author.avatar || ""} alt={blog.author.name} fill className="object-cover" />
              </div>
              <div>
                <p className="text-sm font-bold text-aahar-dark mb-1">{blog.author.name}</p>
                <p className="text-[11px] font-medium text-aahar-body/60 leading-relaxed">
                  Leading expert in global food safety standards and hospitality management systems.
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-8 bg-aahar-dark rounded-[2.5rem] text-white">
            <h3 className="text-xs font-black uppercase tracking-widest text-white/40 mb-6">Want to get certified?</h3>
            <p className="text-sm font-medium text-white/80 leading-relaxed mb-8">
              Join the Aahar network and build trust with your customers today.
            </p>
            <Link href="/certify">
              <button className="w-full bg-aahar-teal py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-aahar-teal/90 transition-colors shadow-lg shadow-aahar-teal/20">
                Apply Now
              </button>
            </Link>
          </div>
        </aside>
      </div>

      {/* Related Posts (Optional) */}
    </article>
  );
}
