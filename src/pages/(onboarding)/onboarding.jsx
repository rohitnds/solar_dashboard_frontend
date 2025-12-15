import OrgModal from "@/components/org-modal";
import React, { useEffect } from 'react'
import IntegrationSelector from "@/components/IntegrationSelector";
import useSitesStore from "@/store/useSitesStore";
import { Navigate } from "react-router-dom";
const Onboarding = () => {

    const availableSites = useSitesStore((state) => state.availableSites);
  const getAvailableSites = useSitesStore((state) => state.fetchAllAvailableSites);

  useEffect(() => {
    getAvailableSites();
  }, []);

  if(availableSites?.active?.length > 0) {
    return <Navigate to="/" replace />;
  }
  return (
    <div>
      <OrgModal />
      <IntegrationSelector />
    </div>
  )
}

export default Onboarding