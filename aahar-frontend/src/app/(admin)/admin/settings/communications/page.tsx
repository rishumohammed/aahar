"use client";

import { Mail, Save, Loader2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { settingsApi } from "@/lib/api";
import { toast } from "sonner";
import { MaterialInput } from "@/components/ui/material-input";

export default function CommunicationsSettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [config, setConfig] = useState({
    email: {
      clientId: "",
      clientSecret: "",
      refreshToken: "",
      fromEmail: "",
    },
    sms: {
      gatewayUrl: "",
      apiKey: "",
      senderId: "",
    }
  });

  useEffect(() => {
    settingsApi.get('communications_config')
      .then(res => {
        if (res.data) {
          setConfig(res.data);
        }
      })
      .catch(err => {
        if (err.response?.status !== 404) {
          console.error('Failed to fetch communications config:', err);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await settingsApi.update('communications_config', config);
      toast.success("Communications configuration saved successfully");
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
            <Mail className="w-5 h-5 text-admin-primary" /> Communications
          </h2>
          <p className="text-slate-600 font-medium text-sm mt-1">Configure Email and SMS gateways for notifications.</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} type="button" className="bg-admin-primary text-white shadow-sm rounded-md px-6 hover:bg-admin-hover font-medium">
          {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />} 
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Email Settings */}
        <Card className="p-6 rounded-lg border-0 shadow-md bg-white space-y-4">
          <h3 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2 mb-4 flex items-center gap-2">
            <Mail className="w-4 h-4 text-slate-500" /> Email Configuration (Google OAuth2)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MaterialInput 
              label="Client ID"
              value={config.email.clientId}
              onChange={e => setConfig({ ...config, email: { ...config.email, clientId: e.target.value } })}
            />
            <MaterialInput 
              label="Client Secret"
              type="password"
              value={config.email.clientSecret}
              onChange={e => setConfig({ ...config, email: { ...config.email, clientSecret: e.target.value } })}
            />
            <MaterialInput 
              label="Refresh Token"
              type="password"
              value={config.email.refreshToken}
              onChange={e => setConfig({ ...config, email: { ...config.email, refreshToken: e.target.value } })}
            />
            <MaterialInput 
              label="From Email Address"
              value={config.email.fromEmail}
              onChange={e => setConfig({ ...config, email: { ...config.email, fromEmail: e.target.value } })}
            />
          </div>
        </Card>

        {/* SMS Settings */}
        <Card className="p-6 rounded-lg border-0 shadow-md bg-white space-y-4">
          <h3 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2 mb-4 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-slate-500" /> SMS Gateway Configuration
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MaterialInput 
              label="Gateway URL"
              value={config.sms.gatewayUrl}
              onChange={e => setConfig({ ...config, sms: { ...config.sms, gatewayUrl: e.target.value } })}
            />
            <MaterialInput 
              label="API Key"
              type="password"
              value={config.sms.apiKey}
              onChange={e => setConfig({ ...config, sms: { ...config.sms, apiKey: e.target.value } })}
            />
            <MaterialInput 
              label="Sender ID"
              value={config.sms.senderId}
              onChange={e => setConfig({ ...config, sms: { ...config.sms, senderId: e.target.value } })}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
