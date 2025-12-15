import React, { useEffect } from 'react'
import { SidebarTrigger } from './ui/sidebar'
import { Separator } from './ui/separator'
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from './ui/breadcrumb'
import { Button } from './ui/button'
import useAuthStore from "@/store/useAuthStore";
import HeaderDatePicker from './HeaderDatePicker'
import { useNavigate } from 'react-router-dom'
import { useSidebar } from "@/components/ui/sidebar";
const Header = ({title}) => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const auth = useAuthStore((state) => state.auth);
  
  const { open } = useSidebar();
  //     const handleLogout = async () => {
  //   try {
  //     const res = await apiDelete("/api/auth/session", null, {}, true);

  //     if (res.status === 204) {
  //       logout();
  //       // navigate("/login");
  //     }
  //   } catch (error) {
  //     console.log(error.message);
  //   }
    
  // };

      useEffect(() => {
        console.log("Sidebar context:", open)
    }, [open]);
  return (
<div className={`fixed top-0 right-0 ${open ? 'w-[calc(100vw-19rem)]' : 'w-full'}`}>
            <header className="flex h-16 shrink-0 items-center bg-sidebar justify-between m-2 border rounded-md gap-2 px-4 b">
          <div className="flex items-center shrink-0">
            <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />

          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>{title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          </div>

          <div className="flex gap-5">
            <HeaderDatePicker />

          {/* <Button className="ml-auto" onClick={handleLogout}>
            Logout
          </Button> */}
          </div>
        </header>
</div>
  )
}

export default Header