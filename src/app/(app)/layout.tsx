import { HeaderMenu, TabBar, Sidebar, StatusBar } from "@/components/layout";
import { getCurrentUser } from "@/lib/dal";
import "./dashboard.css";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  const userRole = user?.quyen ?? "user";

  return (
    <div className="ql-app-shell" suppressHydrationWarning>
      <HeaderMenu />
      <TabBar />
      <div className="ql-workspace">
        <Sidebar />
        <main className="ql-main-content">{children}</main>
      </div>
      <StatusBar userRole={userRole} />
    </div>
  );
}

