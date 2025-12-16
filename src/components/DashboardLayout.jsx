import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  useSidebar,
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
          {children}
          {
            // !auth?.org?.org_id && (<OrgModal />)
          }

      </SidebarInset>
    </SidebarProvider>
  );
}
