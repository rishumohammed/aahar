"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Users, BedDouble } from "lucide-react";
import { enquiryApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useState } from "react";

const formSchema = z.object({
  checkIn: z.string().min(1, "Check-in date is required"),
  checkOut: z.string().min(1, "Check-out date is required"),
  guests: z.string().min(1, "Number of guests is required"),
  roomType: z.string().optional(),
});

interface EnquiryFormProps {
  hotelId: string;
  hotelSlug: string;
  roomTypes: { id: string; name: string }[];
}

export function EnquiryForm({ hotelId, hotelSlug, roomTypes }: EnquiryFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      checkIn: "",
      checkOut: "",
      guests: "2",
      roomType: "any",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setError("");
    try {
      const res = await enquiryApi.create({
        hotelId,
        roomTypeId: values.roomType === "any" || !values.roomType ? undefined : values.roomType,
        checkIn: values.checkIn,
        checkOut: values.checkOut,
        adults: parseInt(values.guests),
      });
      router.push(`/enquiries/${res.data.data.id}`);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to send enquiry. Are you logged in?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 rounded-3xl border border-aahar-border bg-white space-y-6">
      <div className="space-y-1">
        <h4 className="font-bold text-lg text-aahar-dark">Check Availability</h4>
        <p className="text-xs text-aahar-body">Usually responds within 2 hours</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="checkIn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase tracking-wider text-aahar-body">Check-in</FormLabel>
                  <FormControl>
                    <Input type="date" className="pl-3 py-5 rounded-xl border-aahar-border" {...field} />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="checkOut"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase tracking-wider text-aahar-body">Check-out</FormLabel>
                  <FormControl>
                    <Input type="date" className="pl-3 py-5 rounded-xl border-aahar-border" {...field} />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="guests"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold uppercase tracking-wider text-aahar-body">Guests</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="py-6 rounded-xl border-aahar-border">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-aahar-teal" />
                        <SelectValue placeholder="Select guests" />
                      </div>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6].map(n => (
                      <SelectItem key={n} value={n.toString()}>{n} Guest{n > 1 ? 's' : ''}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="text-[10px]" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="roomType"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold uppercase tracking-wider text-aahar-body">Room Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="py-6 rounded-xl border-aahar-border">
                      <div className="flex items-center gap-2">
                        <BedDouble className="h-4 w-4 text-aahar-teal" />
                        <SelectValue placeholder="Select room type" />
                      </div>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {roomTypes.length > 0 ? (
                      <>
                        <SelectItem value="any">Any available room</SelectItem>
                        {roomTypes.map(rt => (
                          <SelectItem key={rt.id} value={rt.id}>{rt.name}</SelectItem>
                        ))}
                      </>
                    ) : (
                      <SelectItem value="any">Any available room</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage className="text-[10px]" />
              </FormItem>
            )}
          />

          {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full bg-aahar-teal hover:bg-aahar-teal/90 text-white rounded-full py-6 font-bold text-lg shadow-lg shadow-aahar-teal/20"
          >
            {loading ? "Sending..." : "Send enquiry"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
