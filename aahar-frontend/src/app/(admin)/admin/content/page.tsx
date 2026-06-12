"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";

import { toast } from "sonner";
import { 
  Globe, 
  Plus, 
  FileEdit, 
  Eye, 
  Clock, 
  MessageSquare, 
  Calendar,
  ChevronRight,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function ContentPage() {
  const [activeTab, setActiveTab] = useState("published");

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Content & Blog</h1>
          <p className="text-slate-600 font-medium text-sm mt-1">Manage public articles, industry news, and newsroom content.</p>
        </div>
        <Button type="button" className="bg-admin-primary text-white shadow-sm rounded-md px-6 hover:bg-admin-hover font-medium">
          <Plus className="h-4 w-4 mr-2" /> New Article
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex bg-white p-1 rounded-md border border-slate-200 shadow-sm w-full lg:w-auto">
          <button 
            onClick={() => setActiveTab("published")} 
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium w-1/2 lg:w-auto text-center transition-colors",
              activeTab === "published" ? "bg-admin-primary text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
            )}
          >
            Published
          </button>
          <button 
            onClick={() => setActiveTab("drafts")} 
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium w-1/2 lg:w-auto text-center transition-colors",
              activeTab === "drafts" ? "bg-admin-primary text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
            )}
          >
            Drafts
          </button>
        </div>
        <div className="relative w-full lg:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder="Search articles..." className="pl-9 pr-4 py-2 w-full text-sm bg-white rounded-md border border-slate-200 focus:ring-2 focus:ring-admin-primary transition-shadow outline-none h-10" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { title: "The Future of Food Safety in 2026", cat: "Industry News", date: "Oct 24, 2026", views: "1,240", author: "Admin Team" },
          { title: "Top 10 Certified Resorts in GCC", cat: "Travel", date: "Oct 22, 2026", views: "3,890", author: "Content Editor" },
          { title: "How AAHAR Audit Works: A Deep Dive", cat: "Guides", date: "Oct 20, 2026", views: "850", author: "Audit Head" },
        ].map((article, i) => (
          <Card key={i} className="group overflow-hidden rounded-lg border border-slate-200 shadow-sm bg-white hover:shadow-md transition-shadow flex flex-col">
            <div className="w-full aspect-video bg-slate-100 flex items-center justify-center relative overflow-hidden border-b border-slate-100">
              <Globe className="h-10 w-10 text-slate-300 group-hover:scale-110 transition-transform duration-500" />
              <Badge variant="secondary" className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-admin-text border-0 text-[10px] font-bold uppercase tracking-wider">{article.cat}</Badge>
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <h3 className="text-lg font-semibold text-slate-800 group-hover:text-admin-primary transition-colors tracking-tight line-clamp-2 mb-3">{article.title}</h3>
              <div className="mt-auto pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs font-medium text-slate-500">
                <div className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {article.date}</div>
                <div className="flex items-center gap-1.5"><Eye className="h-3.5 w-3.5" /> {article.views}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
