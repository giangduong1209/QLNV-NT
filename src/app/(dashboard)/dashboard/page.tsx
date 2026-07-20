"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { IncidentForm } from "@/components/incidents/IncidentForm";
import { getIncidentDetail } from "@/app/services/incident/incident.service";

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const masuco = searchParams.get("masuco");
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    if (masuco) {
      const id = parseInt(masuco);
      if (!isNaN(id)) {
        getIncidentDetail(id)
          .then((data) => setDetail(data))
          .finally(() => setLoading(false));
        return;
      }
    }
    setLoading(false);
  }, [masuco]);

  if (loading) return <p>Loading...</p>;

  // Pass data to IncidentForm if it accepts a prop; otherwise just render.
  return <IncidentForm initialData={detail} />;
}
