import { getCurrentUser } from "@/lib/dal";
import { IncidentForm } from "@/components/incidents/IncidentForm";
import { getIncidentDetail } from "@/services/incident.service";

interface DashboardPageProps {
  searchParams: Promise<{ masuco?: string }>;
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  // Validate authentication
  await getCurrentUser();

  const params = await searchParams;
  const masucoRaw = params?.masuco;
  const masuco = masucoRaw ? parseInt(masucoRaw) : undefined;

  let initialData = null;

  if (masuco && !isNaN(masuco)) {
    const result = await getIncidentDetail(masuco);

    // console.log({ result });
  }

  return <IncidentForm />;
}
