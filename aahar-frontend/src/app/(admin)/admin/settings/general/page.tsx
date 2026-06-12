"use client";

import { Globe, Server, RefreshCw, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function GeneralSettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 tracking-tight">General Configuration</h2>
          <p className="text-slate-600 font-medium text-sm mt-1">Configure global platform behavior.</p>
        </div>
        <Button type="button" className="bg-admin-primary text-white shadow-sm rounded-md px-6 hover:bg-admin-hover font-medium">
          <Save className="h-4 w-4 mr-2" /> Save Changes
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
            <div className="flex gap-2">
              {['India', 'Oman', 'UAE', 'Saudi Arabia'].map(region => (
                <Badge key={region} variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium">{region}</Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-2">
                <Server className="h-4 w-4 text-slate-400" /> API Endpoint URL
              </label>
              <Input defaultValue="https://api.aahar.in/v1" className="bg-white border-slate-300 font-medium rounded-md" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-slate-400" /> Cache Purge (Seconds)
              </label>
              <Input defaultValue="3600" type="number" className="bg-white border-slate-300 font-medium rounded-md" />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
