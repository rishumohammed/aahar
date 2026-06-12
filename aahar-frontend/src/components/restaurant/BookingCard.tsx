"use client";
import { useState, useMemo } from "react";
import { 
  CheckCircle2, 
  Calendar,
  Users,
  Minus,
  Plus,
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export default function BookingCard({ restaurant }: { restaurant: any }) {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [guestCount, setGuestCount] = useState(2);
  const [isSuccess, setIsSuccess] = useState(false);

  const todayStr = format(new Date(), "yyyy-MM-dd");

  const timeSlots = useMemo(() => {
    const openingHours = restaurant.openingHours?.monday || "11:00 AM - 11:00 PM";
    const [startStr, endStr] = openingHours.split(" - ");
    
    const parseTime = (timeStr: string) => {
      if (!timeStr) return 0;
      const [time, modifier] = timeStr.split(" ");
      let [hours, minutes] = time.split(":").map(Number);
      if (modifier === "PM" && hours !== 12) hours += 12;
      if (modifier === "AM" && hours === 12) hours = 0;
      return hours * 60 + minutes;
    };

    const start = parseTime(startStr);
    const end = parseTime(endStr);
    const limit = end - 120; // 2 hours before closing

    const slots = [];
    for (let t = start; t <= limit; t += 30) {
      const h = Math.floor(t / 60);
      const m = t % 60;
      const period = h >= 12 ? "PM" : "AM";
      const displayH = h % 12 === 0 ? 12 : h % 12;
      const displayM = m === 0 ? "00" : m;
      slots.push(`${displayH}:${displayM} ${period}`);
    }
    return slots;
  }, [restaurant.openingHours?.monday]);

  const handleRequestBooking = () => {
    // In a real app, call bookingApi.create(...)
    setIsSuccess(true);
  };

  const resetForm = () => {
    setSelectedDate("");
    setSelectedTime("");
    setGuestCount(2);
    setIsSuccess(false);
  };

  return (
    <Card id="booking-card" className="p-8 rounded-[2.5rem] border-aahar-border shadow-xl space-y-8 overflow-hidden relative">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-2xl bg-aahar-teal/10">
          <Calendar className="h-5 w-5 text-aahar-teal" />
        </div>
        <h3 className="text-xl font-bold text-aahar-dark tracking-tighter uppercase">Reserve a Table</h3>
      </div>

      {isSuccess ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex flex-col items-center text-center space-y-4 py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-emerald-500" />
            </div>
            <div className="space-y-2">
              <h4 className="text-xl font-bold text-aahar-dark uppercase tracking-tight">Reservation requested!</h4>
              <p className="text-sm text-aahar-body leading-relaxed">
                We've sent your request to <span className="font-bold text-aahar-dark">{restaurant.name}</span>. They'll confirm via WhatsApp within 30 minutes.
              </p>
            </div>
          </div>
          <Button 
            variant="link" 
            onClick={resetForm}
            className="w-full text-aahar-teal font-bold text-xs uppercase tracking-widest h-auto p-0"
          >
            Make another booking
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Date Input */}
          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-aahar-body/60 pl-1">Select Date</Label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-aahar-body/40" />
              <input 
                type="date" 
                min={todayStr}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-aahar-border bg-aahar-wash/30 text-sm font-bold focus:ring-2 focus:ring-aahar-teal outline-none transition-all"
              />
            </div>
          </div>

          {/* Time Slots */}
          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-aahar-body/60 pl-1">Select Time</Label>
            <div className="flex flex-wrap gap-2">
              {timeSlots.map(slot => (
                <button
                  key={slot}
                  onClick={() => setSelectedTime(slot)}
                  className={cn(
                    "px-3 py-2 rounded-xl text-[11px] font-bold tracking-tight transition-all border",
                    selectedTime === slot 
                      ? "bg-aahar-teal border-aahar-teal text-white shadow-lg shadow-aahar-teal/20" 
                      : "border-aahar-border bg-white text-aahar-body hover:border-aahar-teal hover:text-aahar-teal"
                  )}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          {/* Guests Counter */}
          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-aahar-body/60 pl-1">Number of Guests</Label>
            <div className="flex items-center justify-between p-2 rounded-2xl border border-aahar-border bg-aahar-wash/30">
              <button 
                onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                disabled={guestCount <= 1}
                className="p-2 rounded-xl bg-white border border-aahar-border text-aahar-body disabled:opacity-30 transition-all hover:border-aahar-teal"
              >
                <Minus className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-aahar-teal" />
                <span className="text-lg font-bold text-aahar-dark">{guestCount}</span>
                <span className="text-xs font-bold text-aahar-body">Guests</span>
              </div>
              <button 
                onClick={() => setGuestCount(Math.min(10, guestCount + 1))}
                disabled={guestCount >= 10}
                className="p-2 rounded-xl bg-white border border-aahar-border text-aahar-body disabled:opacity-30 transition-all hover:border-aahar-teal"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <Button 
            onClick={handleRequestBooking}
            disabled={!selectedDate || !selectedTime}
            className="w-full bg-aahar-teal text-white rounded-2xl py-7 font-bold uppercase tracking-widest shadow-xl shadow-aahar-teal/20 disabled:opacity-40 disabled:shadow-none transition-all active:scale-95"
          >
            Request Table
          </Button>
        </div>
      )}
    </Card>
  );
}
