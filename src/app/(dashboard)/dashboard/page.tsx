import { getCurrentUser } from "@/lib/dal";
import { IncidentForm } from "@/components/incidents/IncidentForm";

export default async function DashboardPage() {
  // Validate authentication
  await getCurrentUser();

  return <IncidentForm />;
}
