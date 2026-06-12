import { blogApi } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";
import { BlogPost } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, ArrowRight } from "lucide-react";

export default async function BlogPage() {
  let blogs: BlogPost[] = [];
  try {
    const res = await blogApi.list();
    blogs = res.data.data || [];
  } catch (e) {
    // Mock data for build
    blogs = [
      {
        id: "1", slug: "mock-blog", title: "Mock Blog Post",
        excerpt: "This is a mock blog post.", content: "Mock",
        coverImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945",
        category: "hygiene", readingTime: "5 min",
        publishedAt: new Date().toISOString(),
        author: { name: "Author" },
        tags: [],
        isFeatured: false
      }
    ];
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Blog Hero */}
      <section className="relative py-24 bg-aahar-teal overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-aahar-rose rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>
        </div>
        <div className="container mx-auto max-w-7xl px-4 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight leading-tight mb-6">
              Insights into <span className="text-aahar-rose">Trust</span> & <span className="text-white/80">Hospitality</span>
            </h1>
            <p className="text-lg text-white/70 font-medium leading-relaxed max-w-xl">
              Stay updated with the latest in food safety standards, hospitality innovations, and the stories behind certified excellence.
            </p>
          </div>
        </div>
      </section>

      {/* Blog Feed */}
      <section className="py-20">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {blogs.map((blog) => (
              <Link 
                key={blog.id} 
                href={`/blog/${blog.slug}`}
                className="group flex flex-col h-full bg-white rounded-[2.5rem] border border-aahar-wash overflow-hidden hover:shadow-2xl hover:shadow-aahar-teal/5 transition-all duration-500 hover:-translate-y-2"
              >
                {/* Image Container */}
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={blog.coverImage}
                    alt={blog.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute top-6 left-6">
                    <Badge className="bg-white/90 backdrop-blur-md text-aahar-teal hover:bg-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border-0 shadow-lg">
                      {blog.category.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8 flex flex-col flex-grow">
                  <div className="flex items-center gap-4 mb-4 text-[10px] font-black uppercase tracking-widest text-aahar-body/40">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3 w-3" />
                      {new Date(blog.publishedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3" />
                      {blog.readingTime}
                    </div>
                  </div>

                  <h2 className="text-xl font-bold text-aahar-dark group-hover:text-aahar-teal transition-colors mb-4 line-clamp-2 leading-snug">
                    {blog.title}
                  </h2>
                  
                  <p className="text-sm text-aahar-body/70 line-clamp-3 mb-8 leading-relaxed font-medium">
                    {blog.excerpt}
                  </p>

                  <div className="mt-auto pt-6 border-t border-aahar-wash flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {blog.author.avatar ? (
                        <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-aahar-wash">
                          <Image src={blog.author.avatar} alt={blog.author.name} fill className="object-cover" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-aahar-wash flex items-center justify-center">
                          <User className="h-4 w-4 text-aahar-body/40" />
                        </div>
                      )}
                      <span className="text-[11px] font-bold text-aahar-dark">{blog.author.name}</span>
                    </div>
                    
                    <div className="w-10 h-10 rounded-full bg-aahar-wash group-hover:bg-aahar-teal group-hover:text-white flex items-center justify-center transition-all duration-300">
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {blogs.length === 0 && (
            <div className="text-center py-32 bg-aahar-wash/30 rounded-[3rem] border-2 border-dashed border-aahar-border">
              <p className="text-aahar-body/60 font-medium">No blog posts found yet. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter / CTA */}
      <section className="pb-24">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="bg-aahar-dark rounded-[3.5rem] p-12 md:p-20 relative overflow-hidden text-center">
            <div className="absolute top-0 right-0 w-64 h-64 bg-aahar-teal/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-aahar-rose/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
            
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Stay in the loop</h2>
              <p className="text-white/60 mb-10 text-lg">Subscribe to our newsletter for exclusive insights and updates from the world of Aahar.</p>
              
              <form className="flex flex-col sm:flex-row gap-4">
                <input 
                  type="email" 
                  placeholder="Enter your email address"
                  className="flex-grow bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-aahar-teal transition-colors"
                  required
                />
                <button type="submit" className="bg-aahar-teal text-white hover:bg-aahar-teal/90 px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-95 shadow-xl shadow-aahar-teal/20">
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
