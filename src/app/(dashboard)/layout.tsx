import { TabBar, Sidebar, StatusBar } from "@/components/layout";
import { EditModeProvider } from "@/lib/edit-mode-context";
import "./dashboard.css";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <EditModeProvider>
      <div className="ql-app-shell">
        <TabBar />
        <div className="ql-workspace">
          <Sidebar />
          <main className="ql-main-content">{children}</main>
        </div>
        <StatusBar />
      </div>
    </EditModeProvider>
  );
}
