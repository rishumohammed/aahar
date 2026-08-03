"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { leadApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { MaterialInput } from "@/components/ui/material-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Store, Building2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { INDIA_STATES, INDIA_STATES_AND_DISTRICTS } from "@/lib/mock/india-states";

const formSchema = z.object({
  enquiryType: z.enum(["list_business", "get_certified"]).default("list_business"),
  entityType: z.enum(["restaurant", "hotel"], {
    required_error: "Please select a business type.",
  }),
  entityName: z.string().min(2, "Business name must be at least 2 characters."),
  address: z.string().min(5, "Address must be at least 5 characters."),
  location: z.string().min(2, "Location is required."),
  city: z.string().min(2, "City is required."),
  district: z.string().min(1, "Please select a district."),
  state: z.string().min(1, "Please select a state."),
  applicantName: z.string().min(2, "Applicant name is required."),
  email: z.string().email("Please enter a valid email address."),
  phone: z.string().min(10, "Phone number must be at least 10 digits."),
  secondaryPhone: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function EnquiryPage() {
  const searchParams = useSearchParams();
  const defaultType = searchParams.get("type") as "restaurant" | "hotel" | null;
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      enquiryType: "list_business",
      entityType: (defaultType === "hotel" || defaultType === "restaurant") ? defaultType : "restaurant",
      entityName: "",
      address: "",
      location: "",
      city: "",
      district: "",
      state: "",
      applicantName: "",
      email: "",
      phone: "",
      secondaryPhone: "",
    },
  });

  const selectedState = form.watch("state");
  const availableDistricts = selectedState ? INDIA_STATES_AND_DISTRICTS[selectedState] || [] : [];

  async function onSubmit(data: FormValues) {
    try {
      await leadApi.create({ ...data, enquiryType: "list_business" });
      console.log("Enquiry submitted:", data);
      toast.success("Listing Enquiry Submitted!", {
        description: "Our onboarding team will reach out to you within 24 hours.",
      });
      setSubmitted(true);
    } catch (error: any) {
      console.error("Submission error:", error?.response?.data || error);
      toast.error("Submission failed", {
        description: error?.response?.data?.message || error.message || "Please try again later.",
      });
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-aahar-wash flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-0 p-10 text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <h2 className="text-3xl font-bold text-aahar-dark">Thank You!</h2>
          <p className="text-aahar-body">
            Your listing enquiry has been received. Our onboarding team will contact you shortly to complete your establishment setup and grant Owner Portal access.
          </p>
          <Link href="/">
            <Button className="mt-4 bg-aahar-teal text-white hover:bg-aahar-teal/90 rounded-xl px-8 py-6 font-bold w-full uppercase tracking-wider shadow-md transition-all hover:shadow-lg">
              Return to Homepage
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-aahar-wash flex flex-col py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full mx-auto">
        <Link href="/" className="inline-flex items-center text-sm font-bold text-aahar-body hover:text-aahar-teal transition-colors mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <div className="bg-white rounded-2xl shadow-xl border border-aahar-border overflow-hidden">
          {/* Header */}
          <div className="bg-aahar-teal text-white py-8 sm:py-12 px-4 sm:px-8 text-center relative">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070')] opacity-10 bg-cover bg-center mix-blend-overlay" />
            <div className="relative z-10">
              <h1 className="text-3xl md:text-5xl font-black tracking-tight uppercase mb-3">List your establishment</h1>
              <p className="text-base sm:text-lg text-white/80 max-w-xl mx-auto font-medium">
                Join India & GCC's fastest growing hospitality trust network. Once listed, you can apply for AAHAR Certification directly from your Owner Portal.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="px-4 sm:px-8 md:px-12 py-8 sm:py-10">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-x-10">

                  {/* Row 1: Business Type */}
                  <FormField
                    control={form.control}
                    name="entityType"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="text-[10px] font-black uppercase tracking-wider text-aahar-body mb-2 block">Business Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="py-6 rounded-xl border-aahar-border text-base h-[58px] bg-transparent focus:ring-0 focus:border-aahar-teal transition-colors">
                              <SelectValue placeholder="Select business type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="restaurant" className="py-3">
                              <div className="flex items-center gap-3">
                                <Store className="h-5 w-5 text-aahar-teal" />
                                <span className="text-base font-medium">Restaurant / Cafe / Cloud Kitchen</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="hotel" className="py-3">
                              <div className="flex items-center gap-3">
                                <Building2 className="h-5 w-5 text-aahar-teal" />
                                <span className="text-base font-medium">Hotel / Resort / Homestay</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Row 2: Names */}
                  <FormField
                    control={form.control}
                    name="entityName"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <MaterialInput label="Business Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="applicantName"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <MaterialInput label="Your Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Row 3: Address */}
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormControl>
                          <MaterialInput label="Full Address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Row 4: State & District */}
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-wider text-aahar-body mb-2 block">State</FormLabel>
                        <Select onValueChange={(val) => {
                            field.onChange(val);
                            form.setValue("district", ""); // Reset district when state changes
                          }} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="py-6 rounded-xl border-aahar-border text-base h-[58px] bg-transparent focus:ring-0 focus:border-aahar-teal transition-colors">
                              <SelectValue placeholder="Select state" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {INDIA_STATES.map((state) => (
                              <SelectItem key={state} value={state} className="py-3">
                                {state}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="district"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-wider text-aahar-body mb-2 block">District</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value}
                          disabled={!selectedState}
                        >
                          <FormControl>
                            <SelectTrigger className="py-6 rounded-xl border-aahar-border text-base h-[58px] bg-transparent focus:ring-0 focus:border-aahar-teal transition-colors">
                              <SelectValue placeholder={selectedState ? "Select district" : "Select state first"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableDistricts.map((district) => (
                              <SelectItem key={district} value={district} className="py-3">
                                {district}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Row 5: City & Location */}
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <MaterialInput label="City" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <MaterialInput label="Location / Area" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Row 6: Email */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormControl>
                          <MaterialInput type="email" label="Email Address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Row 7: Phones */}
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <MaterialInput type="tel" label="Primary Phone" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="secondaryPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <MaterialInput type="tel" label="Secondary Phone (Optional)" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="pt-6 border-t border-aahar-wash">
                  <Button 
                    type="submit" 
                    className="w-full bg-aahar-teal hover:bg-aahar-teal/90 text-white rounded-xl h-14 font-black text-sm uppercase tracking-widest shadow-xl shadow-aahar-teal/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
                  >
                    Submit Enquiry
                  </Button>
                  <p className="text-center text-xs text-aahar-body mt-4 font-medium">
                    By submitting this form, you agree to our Terms of Service and Privacy Policy.
                  </p>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
