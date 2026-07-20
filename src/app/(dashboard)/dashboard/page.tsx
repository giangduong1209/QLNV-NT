"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { IncidentForm } from "@/components/incidents/IncidentForm";

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const masuco = searchParams.get("masuco");
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    if (masuco) {
      setLoading(true);
      fetch(`/api/dashboard?masuco=${encodeURIComponent(masuco)}`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch");
          return res.json();
        })
        .then((data) => setDetail(data))
        .catch((err) => console.error("Error loading incident detail:", err))
        .finally(() => setLoading(false));
    }
  }, [masuco]);

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Đang tải dữ liệu sự cố...
      </div>
    );
  }

  return <IncidentForm initialData={detail} />;
}
