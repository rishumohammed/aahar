"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { restaurantApi } from "@/lib/api";
import RestaurantForm from "@/components/forms/RestaurantForm";
import { Loader2 } from "lucide-react";

export default function EditRestaurantPage() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      restaurantApi.get(id as string).then(res => {
        setData(res.data.data);
        setLoading(false);
      }).catch(err => {
        console.error(err);
        setLoading(false);
      });
    }
  }, [id]);

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-admin-primary" />
      </div>
    );
  }

  if (!data) {
    return <div className="p-20 text-center font-black uppercase text-slate-500">Restaurant not found</div>;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <RestaurantForm initialData={data} isEditing />
    </div>
  );
}
