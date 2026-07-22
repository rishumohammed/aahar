"use client";

import { Globe, Server, RefreshCw, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { settingsApi } from "@/lib/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function GeneralSettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [config, setConfig] = useState({
    regions: ['India', 'Oman', 'UAE', 'Saudi Arabia'],
    apiEndpoint: 'https://api.aahar.in/v1',
    cachePurge: 3600
  });

  const availableRegions = ['India', 'Oman', 'UAE', 'Saudi Arabia', 'Qatar', 'Bahrain', 'Kuwait'];

  useEffect(() => {
    settingsApi.get('general_config')
      .then(res => {
        if (res.data) {
          setConfig(res.data);
        }
      })
      .catch(err => {
        if (err.response?.status !== 404) {
          console.error('Failed to fetch general config:', err);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await settingsApi.update('general_config', config);
      toast.success("General configuration saved successfully");
    } catch (e) {
      toast.error("Failed to save configuration");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleRegion = (region: string) => {
    setConfig(prev => {
      const active = prev.regions.includes(region);
      return {
        ...prev,
        regions: active ? prev.regions.filter(r => r !== region) : [...prev.regions, region]
      };
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-admin-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 tracking-tight">General Configuration</h2>
          <p className="text-slate-600 font-medium text-sm mt-1">Configure global platform behavior.</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} type="button" className="bg-admin-primary text-white shadow-sm rounded-md px-6 hover:bg-admin-hover font-medium">
          {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />} 
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <Card className="p-6 rounded-lg border-0 shadow-md bg-white space-y-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-6">
            <div className="flex items-center gap-4">
              <Globe className="h-5 w-5 text-admin-text" />
              <div>
                <h3 className="text-sm font-semibold text-slate-800">Regional Visibility</h3>
                <p className="text-xs text-slate-500 mt-1">Enable platform in specific markets</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {availableRegions.map(region => {
                const isActive = config.regions.includes(region);
                return (
                  <Badge 
                    key={region} 
                    variant={isActive ? "default" : "secondary"} 
                    className={`cursor-pointer font-medium ${isActive ? 'bg-admin-primary text-white hover:bg-admin-hover' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                    onClick={() => toggleRegion(region)}
                  >
                    {region}
                  </Badge>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-2">
                <Server className="h-4 w-4 text-slate-400" /> API Endpoint URL
              </label>
              <Input 
                value={config.apiEndpoint} 
                onChange={e => setConfig({...config, apiEndpoint: e.target.value})}
                className="bg-white border-slate-300 font-medium rounded-md" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-slate-400" /> Cache Purge (Seconds)
              </label>
              <Input 
                value={config.cachePurge} 
                onChange={e => setConfig({...config, cachePurge: parseInt(e.target.value) || 0})}
                type="number" 
                className="bg-white border-slate-300 font-medium rounded-md" 
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
