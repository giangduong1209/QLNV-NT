import { getSuCoDetail } from "@/actions/incidents";
import { ConfirmIncidents } from "@/components/confirmincidents/ConfirmIncidents";

interface IncidentsPageProps {
  searchParams: Promise<{ masuco?: string }>;
}

export default async function IncidentsPage({
  searchParams,
}: IncidentsPageProps) {
  const params = await searchParams;
  const rawMasuco = params?.masuco;
  const masuco = rawMasuco ? parseInt(rawMasuco, 10) : undefined;

  let initialData = null;
  if (masuco && !isNaN(masuco)) {
    const result = await getSuCoDetail(masuco);
    initialData = result.data ?? null;
  }

  return <ConfirmIncidents initialData={initialData} />;
}
