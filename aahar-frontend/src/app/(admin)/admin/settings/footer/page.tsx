"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { LayoutTemplate, Save, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import api, { settingsApi } from "@/lib/api";

const linkSchema = z.object({
  label: z.string().min(1, "Label is required"),
  type: z.enum(["url", "page"]).optional().default("url"),
  url: z.string().optional(),
  slug: z.string().optional(),
  content: z.string().optional(),
}).refine(data => {
  if (data.type === "page" && !data.slug) return false;
  return true;
}, { message: "Slug is required for custom pages", path: ["slug"] });

const footerConfigSchema = z.object({
  brandDescription: z.string().min(1, "Description is required"),
  ecosystemLinks: z.array(linkSchema),
  companyLinks: z.array(linkSchema),
  contact: z.object({
    email: z.string().email("Invalid email"),
    phone: z.string().min(1, "Phone is required"),
    location: z.string().min(1, "Location is required"),
  }),
});

type FooterConfig = z.infer<typeof footerConfigSchema>;

export default function FooterSettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<FooterConfig>({
    resolver: zodResolver(footerConfigSchema),
    defaultValues: {
      brandDescription: "",
      ecosystemLinks: [],
      companyLinks: [],
      contact: {
        email: "",
        phone: "",
        location: "",
      },
    },
  });

  const ecosystemArray = useFieldArray({
    control: form.control,
    name: "ecosystemLinks",
  });

  const companyArray = useFieldArray({
    control: form.control,
    name: "companyLinks",
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await settingsApi.get("footer_config");
        if (data) {
          form.reset(data);
        } else {
          // Keep defaults empty if nothing in DB
          form.reset({
            brandDescription: "",
            ecosystemLinks: [],
            companyLinks: [],
            contact: {
              email: "",
              phone: "",
              location: "",
            }
          });
        }
      } catch (error: any) {
        if (error.response?.status !== 404) {
          toast.error("Failed to fetch footer settings");
        } else {
          // 404 means setting not created yet, keep defaults empty
          form.reset({
            brandDescription: "",
            ecosystemLinks: [],
            companyLinks: [],
            contact: {
              email: "",
              phone: "",
              location: "",
            }
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [form]);

  const onSubmit = async (values: FooterConfig) => {
    setIsSaving(true);
    try {
      await settingsApi.update("footer_config", values);
      toast.success("Footer configuration saved successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save footer configuration");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="h-40 flex items-center justify-center text-slate-500">Loading settings...</div>;
  }

  const renderLinkFields = (fieldId: string, index: number, arrayName: "ecosystemLinks" | "companyLinks", remove: (i: number) => void) => {
    const type = form.watch(`${arrayName}.${index}.type`);
    return (
      <div key={fieldId} className="flex items-start gap-2 border p-3 rounded-lg bg-slate-50/50 relative">
        <div className="flex-1 space-y-3 pr-6">
          <div className="flex gap-2">
            <Input {...form.register(`${arrayName}.${index}.label` as const)} placeholder="Label" className="h-8 text-sm flex-1 bg-white" />
            <select {...form.register(`${arrayName}.${index}.type` as const)} className="h-8 rounded-md border border-slate-200 text-sm px-2 bg-white outline-none focus:ring-2 focus:ring-slate-400">
              <option value="url">External Link</option>
              <option value="page">Custom Page</option>
            </select>
          </div>
          {form.formState.errors[arrayName]?.[index]?.label && <p className="text-xs text-red-500">{form.formState.errors[arrayName]![index]?.label?.message}</p>}
          
          {type === "page" ? (
            <div className="space-y-2">
              <Input {...form.register(`${arrayName}.${index}.slug` as const)} placeholder="Page Slug (e.g. privacy-policy)" className="h-8 text-sm bg-white" />
              {form.formState.errors[arrayName]?.[index]?.slug && <p className="text-xs text-red-500">{form.formState.errors[arrayName]![index]?.slug?.message}</p>}
              <Textarea {...form.register(`${arrayName}.${index}.content` as const)} placeholder="Page Content (Basic HTML supported)" className="min-h-[120px] text-sm bg-white" />
            </div>
          ) : (
            <Input {...form.register(`${arrayName}.${index}.url` as const)} placeholder="URL" className="h-8 text-sm bg-white" />
          )}
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)} className="h-8 w-8 p-0 text-slate-400 hover:text-red-500 absolute top-3 right-2">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    );
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 tracking-tight flex items-center gap-2">
            <LayoutTemplate className="w-5 h-5 text-admin-primary" /> Footer Content
          </h2>
          <p className="text-slate-600 font-medium text-sm mt-1">Manage public footer text, links, and contact information.</p>
        </div>
        <Button disabled={isSaving} type="submit" className="bg-admin-primary text-white shadow-sm rounded-md px-6 hover:bg-admin-hover font-medium">
          <Save className="h-4 w-4 mr-2" /> {isSaving ? "Saving..." : "Save Configuration"}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        
        {/* Brand Section */}
        <Card className="p-6 rounded-lg border-0 shadow-md bg-white space-y-4">
          <h3 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">Brand Info</h3>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">Brand Description</label>
            <Textarea 
              {...form.register("brandDescription")}
              className="bg-white border-slate-300 font-medium rounded-md min-h-[100px]" 
            />
            {form.formState.errors.brandDescription && (
              <p className="text-xs text-red-500">{form.formState.errors.brandDescription.message}</p>
            )}
          </div>
        </Card>

        {/* Links Sections Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          
          {/* Ecosystem Links */}
          <Card className="p-6 rounded-lg border-0 shadow-md bg-white space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-semibold text-slate-800">Ecosystem Links</h3>
              <Button type="button" variant="outline" size="sm" onClick={() => ecosystemArray.append({ label: "", type: "url", url: "" })} className="h-8">
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </div>
            
            <div className="space-y-3">
              {ecosystemArray.fields.map((field, index) => renderLinkFields(field.id, index, "ecosystemLinks", ecosystemArray.remove))}
              {ecosystemArray.fields.length === 0 && <p className="text-xs text-slate-500 italic">No links added.</p>}
            </div>
          </Card>

          {/* Company Links */}
          <Card className="p-6 rounded-lg border-0 shadow-md bg-white space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-semibold text-slate-800">Company Links</h3>
              <Button type="button" variant="outline" size="sm" onClick={() => companyArray.append({ label: "", type: "url", url: "" })} className="h-8">
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </div>
            
            <div className="space-y-3">
              {companyArray.fields.map((field, index) => renderLinkFields(field.id, index, "companyLinks", companyArray.remove))}
              {companyArray.fields.length === 0 && <p className="text-xs text-slate-500 italic">No links added.</p>}
            </div>
          </Card>

        </div>

        {/* Contact Info */}
        <Card className="p-6 rounded-lg border-0 shadow-md bg-white space-y-4">
          <h3 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">Email Address</label>
              <Input {...form.register("contact.email")} className="bg-white border-slate-300 font-medium rounded-md" />
              {form.formState.errors.contact?.email && (
                <p className="text-xs text-red-500">{form.formState.errors.contact.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">Phone Number</label>
              <Input {...form.register("contact.phone")} className="bg-white border-slate-300 font-medium rounded-md" />
              {form.formState.errors.contact?.phone && (
                <p className="text-xs text-red-500">{form.formState.errors.contact.phone.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">Location (Address)</label>
              <Input {...form.register("contact.location")} className="bg-white border-slate-300 font-medium rounded-md" />
              {form.formState.errors.contact?.location && (
                <p className="text-xs text-red-500">{form.formState.errors.contact.location.message}</p>
              )}
            </div>
          </div>
        </Card>

      </div>
    </form>
  );
}
