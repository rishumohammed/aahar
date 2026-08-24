"use client";

import { Palette, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { settingsApi } from "@/lib/api";
import { toast } from "sonner";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { useBrandingStore } from "@/store/brandingStore";
import { getImageUrl } from "@/lib/utils";

export default function BrandingSettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [config, setConfig] = useState({
    logoLight: "",
    logoDark: "",
    favicon: ""
  });

  useEffect(() => {
    settingsApi.get('branding_config')
      .then(res => {
        if (res.data) {
          const parsed = typeof res.data === "string" ? JSON.parse(res.data) : res.data;
          setConfig({
            logoLight: parsed.logoLight || "",
            logoDark: parsed.logoDark || "",
            favicon: parsed.favicon || ""
          });
        }
      })
      .catch(err => {
        if (err.response?.status !== 404) {
          console.error('Failed to fetch branding config:', err);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await settingsApi.update('branding_config', config);
      useBrandingStore.getState().setBranding(config);
      toast.success("Branding configuration saved successfully");
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
            <Palette className="w-5 h-5 text-admin-primary" /> Branding
          </h2>
          <p className="text-slate-600 font-medium text-sm mt-1">Manage logos and brand identity assets.</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} type="button" className="bg-admin-primary text-white shadow-sm rounded-md px-6 hover:bg-admin-hover font-medium">
          {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />} 
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <Card className="p-6 rounded-lg border-0 shadow-md bg-white space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2 mb-4">Logo (Light Mode)</h3>
            <p className="text-xs text-slate-500 mb-4">Displayed on light backgrounds (like the admin panel).</p>
            <div className="space-y-4">
              <ImageUpload 
                value={config.logoLight} 
                onChange={(url) => setConfig({ ...config, logoLight: url })} 
                label="Upload Light Logo"
              />
              {config.logoLight && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center justify-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase mb-2">Light Logo Preview</span>
                  <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm max-w-full flex items-center justify-center min-h-[80px]">
                    <img 
                      src={getImageUrl(config.logoLight)} 
                      alt="Light Logo Preview" 
                      className="max-h-12 object-contain"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2 mb-4">Logo (Dark Mode)</h3>
            <p className="text-xs text-slate-500 mb-4">Displayed on dark backgrounds (like the user-facing site footer).</p>
            <div className="space-y-4">
              <ImageUpload 
                value={config.logoDark} 
                onChange={(url) => setConfig({ ...config, logoDark: url })} 
                label="Upload Dark Logo"
              />
              {config.logoDark && (
                <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex flex-col items-center justify-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase mb-2">Dark Logo Preview</span>
                  <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 shadow-sm max-w-full flex items-center justify-center min-h-[80px]">
                    <img 
                      src={getImageUrl(config.logoDark)} 
                      alt="Dark Logo Preview" 
                      className="max-h-12 object-contain"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2 mb-4">Favicon</h3>
            <p className="text-xs text-slate-500 mb-4">Displayed in the browser tab.</p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="w-full sm:w-32">
                <ImageUpload 
                  value={config.favicon} 
                  onChange={(url) => setConfig({ ...config, favicon: url })} 
                  label="Favicon"
                />
              </div>
              {config.favicon && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center justify-center w-32 h-32 shrink-0">
                  <span className="text-[10px] font-bold text-slate-400 uppercase mb-2">Favicon Preview</span>
                  <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
                    <img 
                      src={getImageUrl(config.favicon)} 
                      alt="Favicon Preview" 
                      className="w-8 h-8 object-contain"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
