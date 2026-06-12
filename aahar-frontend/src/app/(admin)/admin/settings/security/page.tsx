"use client";

import { ShieldCheck, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function SecuritySettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 tracking-tight">Security & Access</h2>
          <p className="text-slate-600 font-medium text-sm mt-1">Manage platform security and developer settings.</p>
        </div>
        <Button type="button" className="bg-admin-primary text-white shadow-sm rounded-md px-6 hover:bg-admin-hover font-medium">
          <Save className="h-4 w-4 mr-2" /> Save Changes
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
            <div className="w-10 h-5 bg-admin-primary rounded-full relative p-0.5 cursor-pointer">
              <div className="w-4 h-4 bg-white rounded-full absolute right-0.5 shadow-sm" />
            </div>
          </div>

          <div className="flex items-center justify-between pb-6 border-b border-slate-200">
            <div>
              <h4 className="text-sm font-semibold text-slate-800">Two-Factor Authentication</h4>
              <p className="text-xs text-slate-500 mt-1">Mandatory for all Admin and Auditor accounts.</p>
            </div>
            <div className="w-10 h-5 bg-slate-200 rounded-full relative p-0.5 cursor-pointer">
              <div className="w-4 h-4 bg-white rounded-full absolute left-0.5 shadow-sm" />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-slate-800">Developer Mode</h4>
              <p className="text-xs text-slate-500 mt-1">Allow direct database console access for Super Admins.</p>
            </div>
            <div className="w-10 h-5 bg-slate-200 rounded-full relative p-0.5 cursor-pointer">
              <div className="w-4 h-4 bg-white rounded-full absolute left-0.5 shadow-sm" />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
