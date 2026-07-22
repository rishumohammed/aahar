"use client";

import { ShieldCheck, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { settingsApi } from "@/lib/api";
import { toast } from "sonner";

export default function SecuritySettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [config, setConfig] = useState({
    automaticVerification: true,
    twoFactorAuth: false,
    developerMode: false
  });

  useEffect(() => {
    settingsApi.get('security_config')
      .then(res => {
        if (res.data) {
          setConfig(res.data);
        }
      })
      .catch(err => {
        if (err.response?.status !== 404) {
          console.error('Failed to fetch security config:', err);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await settingsApi.update('security_config', config);
      toast.success("Security configuration saved successfully");
    } catch (e) {
      toast.error("Failed to save configuration");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSetting = (key: keyof typeof config) => {
    setConfig(prev => ({ ...prev, [key]: !prev[key] }));
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
          <h2 className="text-xl font-semibold text-slate-900 tracking-tight">Security & Access</h2>
          <p className="text-slate-600 font-medium text-sm mt-1">Manage platform security and developer settings.</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} type="button" className="bg-admin-primary text-white shadow-sm rounded-md px-6 hover:bg-admin-hover font-medium">
          {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />} 
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <Card className="p-6 rounded-lg border-0 shadow-md bg-white space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-6 border-b border-slate-200">
            <div className="flex items-center gap-4">
              <ShieldCheck className="h-5 w-5 text-admin-text" />
              <div>
                <h3 className="text-sm font-semibold text-slate-800">Automatic Verification</h3>
                <p className="text-xs text-slate-500 mt-1">Enable AI-assisted document screening</p>
              </div>
            </div>
            <div 
              onClick={() => toggleSetting('automaticVerification')}
              className={`w-10 h-5 rounded-full relative p-0.5 cursor-pointer transition-colors ${config.automaticVerification ? 'bg-admin-primary' : 'bg-slate-200'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full absolute shadow-sm transition-transform ${config.automaticVerification ? 'right-0.5' : 'left-0.5'}`} />
            </div>
          </div>

          <div className="flex items-center justify-between pb-6 border-b border-slate-200">
            <div>
              <h4 className="text-sm font-semibold text-slate-800">Two-Factor Authentication</h4>
              <p className="text-xs text-slate-500 mt-1">Mandatory for all Admin and Auditor accounts.</p>
            </div>
            <div 
              onClick={() => toggleSetting('twoFactorAuth')}
              className={`w-10 h-5 rounded-full relative p-0.5 cursor-pointer transition-colors ${config.twoFactorAuth ? 'bg-admin-primary' : 'bg-slate-200'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full absolute shadow-sm transition-transform ${config.twoFactorAuth ? 'right-0.5' : 'left-0.5'}`} />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-slate-800">Developer Mode</h4>
              <p className="text-xs text-slate-500 mt-1">Allow direct database console access for Super Admins.</p>
            </div>
            <div 
              onClick={() => toggleSetting('developerMode')}
              className={`w-10 h-5 rounded-full relative p-0.5 cursor-pointer transition-colors ${config.developerMode ? 'bg-admin-primary' : 'bg-slate-200'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full absolute shadow-sm transition-transform ${config.developerMode ? 'right-0.5' : 'left-0.5'}`} />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
