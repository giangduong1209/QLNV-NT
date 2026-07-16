import { redirect } from "next/navigation";
import { verifySession } from "@/lib/session";

export default async function HomePage() {
  const session = await verifySession();

  if (session?.userId) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }
}
