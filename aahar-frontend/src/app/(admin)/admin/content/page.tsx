"use client";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { 
  Globe, 
  Plus, 
  Pencil,
  Trash2,
  Eye, 
  Calendar,
  Search,
  Loader2,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { blogApi, uploadApi } from "@/lib/api";

export default function ContentPage() {
  const [activeTab, setActiveTab] = useState("published");
  const [search, setSearch] = useState("");
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "", slug: "", category: "industry_news", readingTime: "5 min", excerpt: "", content: "", status: "draft", coverImage: ""
  });
  const [saving, setSaving] = useState(false);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const res = await blogApi.list({ limit: 100 });
      setBlogs(res.data.data.items || res.data.data || []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load articles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBlogs(); }, []);

  const handleOpenCreate = () => {
    setEditingBlog(null);
    setFormData({ title: "", slug: "", category: "industry_news", readingTime: "5 min", excerpt: "", content: "", status: "draft", coverImage: "" });
    setModalOpen(true);
  };

  const handleOpenEdit = (blog: any) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title, 
      slug: blog.slug, 
      category: blog.category, 
      readingTime: blog.readingTime, 
      excerpt: blog.excerpt || "", 
      content: blog.content, 
      status: blog.status, 
      coverImage: blog.coverImage || ""
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.slug || !formData.content) {
      return toast.error("Please fill in required fields");
    }
    setSaving(true);
    try {
      if (editingBlog) {
        await blogApi.update(editingBlog.id, formData);
        toast.success("Article updated successfully");
      } else {
        await blogApi.create(formData);
        toast.success("Article created successfully");
      }
      setModalOpen(false);
      fetchBlogs();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to save article");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this article permanently? This action cannot be undone.")) return;
    try {
      await blogApi.delete(id);
      toast.success("Article deleted");
      fetchBlogs();
    } catch (e) {
      toast.error("Failed to delete article");
    }
  };

  const filtered = blogs.filter(b => {
    const statusMatch = activeTab === "drafts" ? b.status === "draft" : b.status === "published";
    const searchMatch = b.title.toLowerCase().includes(search.toLowerCase()) || b.category.toLowerCase().includes(search.toLowerCase());
    return statusMatch && searchMatch;
  });

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Content & Blog</h1>
          <p className="text-slate-600 font-medium text-sm mt-1">Manage public articles, industry news, and newsroom content.</p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-admin-primary text-white shadow-sm rounded-lg h-11 px-6 hover:bg-admin-hover font-semibold tracking-wide">
          <Plus className="h-4 w-4 mr-2" /> New Article
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex bg-slate-50 p-1 rounded-xl w-full lg:w-auto shadow-inner border border-slate-100">
          <button 
            onClick={() => setActiveTab("published")} 
            className={cn(
              "px-6 py-2.5 rounded-lg text-sm font-semibold w-1/2 lg:w-auto text-center transition-all",
              activeTab === "published" ? "bg-white text-admin-primary shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-700"
            )}
          >
            Published
          </button>
          <button 
            onClick={() => setActiveTab("drafts")} 
            className={cn(
              "px-6 py-2.5 rounded-lg text-sm font-semibold w-1/2 lg:w-auto text-center transition-all",
              activeTab === "drafts" ? "bg-white text-admin-primary shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-700"
            )}
          >
            Drafts
          </button>
        </div>
        <div className="relative w-full lg:max-w-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles..." 
            className="pl-12 pr-4 py-2 w-full text-sm bg-slate-50 rounded-xl border-slate-200 focus:ring-2 focus:ring-admin-primary transition-shadow outline-none h-12 font-medium placeholder:text-slate-400" 
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <Loader2 className="w-10 h-10 text-admin-primary animate-spin" />
          <p className="text-slate-500 font-medium">Loading articles...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((article) => (
              <Card key={article.id} className="group overflow-hidden rounded-2xl border border-slate-200 shadow-sm bg-white hover:shadow-md transition-shadow flex flex-col">
                <div className="w-full aspect-video bg-slate-100 flex items-center justify-center relative overflow-hidden border-b border-slate-100">
                  {article.coverImage ? (
                    <img src={article.coverImage} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <Globe className="h-10 w-10 text-slate-300 group-hover:scale-110 transition-transform duration-500" />
                  )}
                  <div className="absolute top-4 left-4">
                    <Badge variant="secondary" className="bg-white/95 backdrop-blur-sm text-admin-text border-0 text-[10px] font-bold uppercase tracking-wider shadow-sm px-3 py-1 rounded-full">
                      {article.category.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a href={`/blog/${article.slug}`} target="_blank" rel="noreferrer">
                      <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-white/95 backdrop-blur-sm text-slate-700 hover:text-emerald-600 shadow-sm">
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </a>
                    <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-white/95 backdrop-blur-sm text-slate-700 hover:text-admin-primary shadow-sm" onClick={() => handleOpenEdit(article)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-white/95 backdrop-blur-sm text-slate-700 hover:text-rose-600 shadow-sm" onClick={() => handleDelete(article.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-slate-800 group-hover:text-admin-primary transition-colors tracking-tight line-clamp-2 mb-3">{article.title}</h3>
                  <div className="mt-auto pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-slate-500">
                    <div className="flex items-center gap-1.5"><Calendar className="h-4 w-4 text-slate-400" /> {new Date(article.createdAt).toLocaleDateString()}</div>
                    <div className="flex items-center gap-1.5"><Eye className="h-4 w-4 text-slate-400" /> {Math.floor(Math.random() * 500) + 50}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-20 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
              <FileText className="w-12 h-12 mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500 font-medium text-lg">No {activeTab} articles found.</p>
            </div>
          )}
        </>
      )}

      {/* Editor Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-3xl lg:max-w-5xl bg-white rounded-xl p-0 overflow-hidden border-slate-200 shadow-2xl">
          <div className="bg-slate-50 px-8 py-6 border-b border-slate-200">
            <DialogTitle className="text-xl font-bold text-slate-900 tracking-tight">
              {editingBlog ? "Edit Article" : "Compose New Article"}
            </DialogTitle>
            <p className="text-sm font-medium text-slate-500 mt-1">Publish insightful content for the trust network.</p>
          </div>
          
          <div className="p-8 max-h-[60vh] overflow-y-auto no-scrollbar space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Article Title</Label>
                <Input className="h-11 bg-white border-slate-200 rounded-lg font-medium shadow-sm" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. The Future of Food Safety" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">URL Slug</Label>
                <Input className="h-11 bg-white border-slate-200 rounded-lg font-medium shadow-sm" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} placeholder="e.g. future-of-food-safety" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Category</Label>
                <Select value={formData.category} onValueChange={v => setFormData({...formData, category: v})}>
                  <SelectTrigger className="h-11 bg-white border-slate-200 rounded-lg font-medium shadow-sm capitalize">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="industry_news">Industry News</SelectItem>
                    <SelectItem value="hygiene">Hygiene & Safety</SelectItem>
                    <SelectItem value="guides">Guides & Tutorials</SelectItem>
                    <SelectItem value="travel">Travel & Hospitality</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</Label>
                <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v})}>
                  <SelectTrigger className="h-11 bg-white border-slate-200 rounded-lg font-medium shadow-sm capitalize">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft" className="text-amber-600 font-semibold">Draft</SelectItem>
                    <SelectItem value="published" className="text-emerald-600 font-semibold">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Cover Image</Label>
                <div className="flex gap-4 items-center">
                  {formData.coverImage && (
                    <img src={formData.coverImage} alt="Cover" className="h-11 w-11 object-cover rounded-lg border border-slate-200 shadow-sm" />
                  )}
                  <Input 
                    type="file" 
                    accept="image/*"
                    className="h-11 bg-white border-slate-200 rounded-lg font-medium shadow-sm flex-1 cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-50 file:text-admin-primary hover:file:bg-slate-100" 
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        const toastId = toast.loading("Uploading image...");
                        const res = await uploadApi.singlePhoto(file);
                        const url = res.data?.data?.url || res.data?.url;
                        setFormData({...formData, coverImage: url});
                        toast.success("Image uploaded", { id: toastId });
                      } catch (err) {
                        toast.error("Failed to upload image");
                      }
                    }} 
                  />
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Short Excerpt</Label>
                <Textarea className="bg-white border-slate-200 rounded-lg font-medium shadow-sm resize-none" rows={3} value={formData.excerpt} onChange={e => setFormData({...formData, excerpt: e.target.value})} placeholder="A brief summary of the article..." />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Full Content (Markdown/HTML)</Label>
                <Textarea className="bg-white border-slate-200 rounded-lg font-medium shadow-sm font-mono text-sm" rows={12} value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} placeholder="Write your article content here..." />
              </div>
            </div>
          </div>
          
          <div className="px-8 py-5 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
            <Button variant="outline" className="h-10 px-6 rounded-lg font-semibold text-slate-600 border-slate-300" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button className="h-10 px-8 rounded-lg font-semibold bg-admin-primary hover:bg-admin-hover text-white shadow-sm" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Article"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
