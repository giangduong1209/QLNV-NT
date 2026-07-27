import { IncidentReportForm } from "@/components/dashboard/IncidentReportForm";
import { getSuCoDetail } from "@/actions/incidents";
import { getLookupData } from "@/actions/lookup";

interface DashboardPageProps {
  searchParams: Promise<{ masuco?: string }>;
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const params = await searchParams;
  const masucoRaw = params?.masuco;
  const masuco = masucoRaw ? parseInt(masucoRaw) : undefined;

  // Fetch lookup tables & incident detail song song
  const lookupData = await getLookupData();

  let initialData = null;
  if (masuco && !isNaN(masuco)) {
    const result = await getSuCoDetail(masuco);
    initialData = result.data ?? null;
  }

  return (
    <IncidentReportForm
      initialData={initialData}
      lookupData={lookupData}
      isNew={!masuco}
    />
  );
}
