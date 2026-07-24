import { TabBar, Sidebar, StatusBar } from "@/components/layout";
import { EditModeProvider } from "@/lib/edit-mode-context";
import { getCurrentUser } from "@/lib/dal";
import "./dashboard.css";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  const userRole = user?.quyen ?? "user";

  return (
    <EditModeProvider>
      <div className="ql-app-shell">
        <TabBar />
        <div className="ql-workspace">
          <Sidebar />
          <main className="ql-main-content">{children}</main>
        </div>
        <StatusBar userRole={userRole} />
      </div>
    </EditModeProvider>
  );
}
