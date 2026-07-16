import { getCurrentUser } from "@/lib/dal";
import { ConfirmIncidents } from "@/components/confirmincidents/ConfirmIncidents";

export default async function IncidentsPage() {
  // await getCurrentUser();
  console.log("test");

  return <ConfirmIncidents />;
}
