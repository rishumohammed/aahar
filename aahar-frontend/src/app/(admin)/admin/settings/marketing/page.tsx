"use client";

import { Megaphone, Save, Loader2, LineChart, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { settingsApi } from "@/lib/api";
import { toast } from "sonner";
import { MaterialInput } from "@/components/ui/material-input";

export default function MarketingSettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [config, setConfig] = useState({
    googleAnalyticsId: "",
    metaPixelId: "",
    seo: {
      defaultTitle: "",
      defaultDescription: "",
      defaultKeywords: "",
    }
  });

  useEffect(() => {
    settingsApi.get('marketing_config')
      .then(res => {
        if (res.data) {
          setConfig(res.data);
        }
      })
      .catch(err => {
        if (err.response?.status !== 404) {
          console.error('Failed to fetch marketing config:', err);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await settingsApi.update('marketing_config', config);
      toast.success("Marketing & SEO configuration saved successfully");
    } catch (e) {
      toast.error("Failed to save configuration");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-admin-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 tracking-tight flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-admin-primary" /> Marketing & SEO
          </h2>
          <p className="text-slate-600 font-medium text-sm mt-1">Configure digital marketing tools and default SEO attributes.</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} type="button" className="bg-admin-primary text-white shadow-sm rounded-md px-6 hover:bg-admin-hover font-medium">
          {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />} 
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Integrations */}
        <Card className="p-6 rounded-lg border-0 shadow-md bg-white space-y-4">
          <h3 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2 mb-4 flex items-center gap-2">
            <LineChart className="w-4 h-4 text-slate-500" /> Tracking Integrations
          </h3>
          <div className="space-y-6 pt-2">
            <MaterialInput 
              label="Google Analytics Measurement ID"
              placeholder="e.g. G-XXXXXXXXXX"
              value={config.googleAnalyticsId}
              onChange={e => setConfig({ ...config, googleAnalyticsId: e.target.value })}
            />
            <MaterialInput 
              label="Meta Pixel ID"
              placeholder="e.g. 123456789012345"
              value={config.metaPixelId}
              onChange={e => setConfig({ ...config, metaPixelId: e.target.value })}
            />
          </div>
        </Card>

        {/* SEO */}
        <Card className="p-6 rounded-lg border-0 shadow-md bg-white space-y-4">
          <h3 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2 mb-4 flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-500" /> Default SEO Metadata
          </h3>
          <div className="space-y-6 pt-2">
            <MaterialInput 
              label="Default Page Title"
              value={config.seo.defaultTitle}
              onChange={e => setConfig({ ...config, seo: { ...config.seo, defaultTitle: e.target.value } })}
            />
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">Default Meta Description</label>
              <Textarea 
                value={config.seo.defaultDescription}
                onChange={e => setConfig({ ...config, seo: { ...config.seo, defaultDescription: e.target.value } })}
                className="bg-white border-slate-300 font-medium rounded-md min-h-[100px] resize-none" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">Keywords (Comma separated)</label>
              <Textarea 
                value={config.seo.defaultKeywords}
                onChange={e => setConfig({ ...config, seo: { ...config.seo, defaultKeywords: e.target.value } })}
                className="bg-white border-slate-300 font-medium rounded-md min-h-[60px] resize-none" 
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
