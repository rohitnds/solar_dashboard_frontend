import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "@/store/useAuthStore";

export default function AuthRoute() {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const checkVerify = useAuthStore((state) => state.checkVerify);
  const getOrg = useAuthStore((state) => state.getOrg);

  const isLoggedIn = checkAuth();
  const isVerified = checkVerify();
  const org = getOrg();

  console.log(org);
  

  if (isLoggedIn && isVerified && org.length > 0) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
