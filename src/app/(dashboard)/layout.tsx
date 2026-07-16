import { TabBar, Sidebar, StatusBar } from "@/components/layout";
import "./dashboard.css";


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="ql-app-shell">
      <TabBar />
      <div className="ql-workspace">
        <Sidebar />
        <main className="ql-main-content">
          {children}
        </main>
      </div>
      <StatusBar />
    </div>
  );
}
