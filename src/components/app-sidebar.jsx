import * as React from "react"
import { SunMedium, ActivitySquare, LayoutDashboard } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { Link } from "react-router-dom";
import useSitesStore from "@/store/useSitesStore";
import { NavUser } from "./nav-user";
import useOrgStore from "@/store/useOrgStore";

export function AppSidebar(props) {
  const availableSites = useSitesStore((state) => state.availableSites);
    const {org, getOrgInfo} = useOrgStore();
    React.useEffect(() => {
      getOrgInfo();
    }, [getOrgInfo]);

  // ---------------------------
  // DIRECT MENU (STATIC)
  // ---------------------------
  const directMenu = {
    title: "",
    url: "",
    items: [
      {
        title: "Fleet Overview",
        url: "/",
        Icon: ActivitySquare,
      },
    ],
  };

  // ---------------------------
  // SITES MENU (DYNAMIC)
  // ---------------------------
  const sitesMenu = {
    title: "Sites",
    url: "",
    items: (availableSites?.active || []).map((site) => ({
      title: site.site_details?.name || "Unknown",
      url: `/site/${site.site_id}`, // <-- dynamic path
    })),
  };

  const allMenus = [directMenu, sitesMenu];

  return (
    <Sidebar variant="floating" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <SunMedium className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold text-lg">{org?.org_name}</span>
                  {/* <span>v1.0.0</span> */}
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu className="gap-2">
            {allMenus.map((group) => (
              <SidebarMenuItem key={group.title}>
                {group.title && (
                  <SidebarMenuButton asChild className="py-4">
                    <span className="font-medium">{group.title}</span>
                  </SidebarMenuButton>
                )}

                {group.items?.length > 0 && (
                  <SidebarMenuSub className="ml-0 border-l-0 px-1.5">
                    {group.items.map((item) => (
                      <SidebarMenuSubItem key={item.title}>
                        <SidebarMenuSubButton
                          className="py-3"
                          asChild
                        >
                          <Link to={item.url} className="font-medium flex gap-2">
                            {item.Icon && <item.Icon className="h-4 w-4" />}
                            {item.title}
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
