// import { getSuCoDetail } from "@/actions/incidents";
import { ConfirmIncidents } from "@/components/confirmincidents/ConfirmIncidents";

interface IncidentsPageProps {
  searchParams: Promise<{ masuco?: string }>;
}

export default async function IncidentsPage({
  searchParams,
}: IncidentsPageProps) {
  const params = await searchParams;
  const masucoRaw = params?.masuco;
  const masuco = masucoRaw ? parseInt(masucoRaw) : undefined;

  let initialData = null;
  if (masuco && !isNaN(masuco)) {
    // const result = await getSuCoDetail(masuco);
    // initialData = result.data;
  }

  return <ConfirmIncidents initialData={initialData} />;
}
