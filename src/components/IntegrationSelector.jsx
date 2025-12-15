import { useEffect, useState } from "react";
import useIntegrationStore from "@/store/useIntegrationStore";
import IntegrationModal from "@/components/IntegrationModal";
import { Button } from "./ui/button";
import SiteSelectorModal from "./SiteSelectorModal";
import { set } from "zod";

export default function IntegrationsPage() {
  const { integrations, availableIntegrations, fetchIntegrations, isLoading, fetchAvailableIntegrations } = useIntegrationStore();
  const [selected, setSelected] = useState(null);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    (async () => {
      await fetchAvailableIntegrations();
      await fetchIntegrations();
    })();
  }, []);

  console.log(availableIntegrations);
  // console.log(integrations);

  const handleOrgSelection = (intg) => {
    const match = availableIntegrations.find(
      (item) => item.integration_id === intg.integration_id
    );

    const membershipId = match?.membership_id;

    if(membershipId) {
      console.log(membershipId);
      setSelectedOrg(membershipId);
      setModalOpen(true);
    }
  }

  

  if (isLoading)
    return <p className="text-center text-muted-foreground">Loading integrations…</p>;

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold mb-2">Available Integrations</h1>
      <p className="text-muted-foreground mb-6">
        Connect your data sources to Solar-smart in one click.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {integrations.map((intg) => (
          <div
            key={intg.integration_id}
            className="border rounded-xl p-5 shadow-sm hover:shadow-md transition cursor-pointer bg-card"
  
          >
            <div className="flex items-center gap-4 mb-4">
              <img
                src={intg.integration_icon}
                alt={intg.integration_name}
                className="w-30 h-auto rounded-md object-contain"
              />
                <h3 className=" text-lg font-medium">{intg.integration_name}</h3>
            </div>

            {
              
  availableIntegrations?.some(
    (item) => item.integration_id === intg.integration_id
  ) ? (
    <Button variant="outline" onClick={() => handleOrgSelection(intg)}>
              Configure Site
            </Button>
  ) : (
    <Button onClick={() => setSelected(intg)}>
              Configure Integration
            </Button>
  )
}
            <p className="text-xs mt-4 text-muted-foreground">
                  Version: {intg.version}
                </p>
          </div>
        ))}
      </div>

      {selected && (
        <IntegrationModal
          integration={selected}
          onClose={() => setSelected(null)}
        />
      )}

      <SiteSelectorModal
        orgId={selectedOrg}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>

  );
}
