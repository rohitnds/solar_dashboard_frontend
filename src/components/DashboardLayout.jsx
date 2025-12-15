import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";

import { apiDelete } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import useAuthStore from "@/store/useAuthStore";
import OrgModal from "./org-modal";
import Header from "./Header";


export default function DashboardLayout({ children, title = "Dashboard" }) {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const auth = useAuthStore((state) => state.auth);



  return (
    <SidebarProvider style={{ "--sidebar-width": "19rem" }}>
      <AppSidebar />

      <SidebarInset>
        {/* HEADER */}
        <Header title={title} />

        {/* MAIN CONTENT AREA */}
        <div className="flex flex-1 flex-col gap-4 p-2 mt-21 pt-0">
          {children}
          {
            // !auth?.org?.org_id && (<OrgModal />)
          }

        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
