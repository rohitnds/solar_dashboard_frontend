import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "@/store/useAuthStore";
import useSitesStore from "@/store/useSitesStore";
import { useEffect } from "react";

export default function ProtectedRoute() {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const checkVerify = useAuthStore((state) => state.checkVerify);
  const availableSites = useSitesStore((state) => state.availableSites);
  const getAvailableSites = useSitesStore((state) => state.fetchAllAvailableSites);

  useEffect(() => {
    getAvailableSites();
  }, []);

  console.log(availableSites?.active?.length);
  

  const isLoggedIn = checkAuth();
  const isVerified = checkVerify();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (isLoggedIn && !isVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  if(availableSites?.active?.length === 0) {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
}
