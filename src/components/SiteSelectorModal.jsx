"use client";

import { useEffect, useState } from "react";
import useSitesStore from "@/store/useSitesStore";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function SiteSelectorModal({ orgId, open, onClose }) {
  const {
    availableSites,
    selectedSites,
    fetchSites,
    setSelectedSites,
    saveSites,
    allOrgSites,
    fetchAllAvailableSites
  } = useSitesStore();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && orgId) {
      fetchSites(orgId);
    }
    
  }, [open, orgId, fetchSites]);

  useEffect(() => {
    fetchAllAvailableSites();

    if(availableSites?.active?.length > 0) {
      setSelectedSites(availableSites.active.map(site => site.site_id));
    }
  },[])

  console.log("selectedSites :",selectedSites);
  

  const handleToggleSite = (siteId) => {
    if (selectedSites.includes(siteId)) {
      setSelectedSites(selectedSites.filter((id) => id !== siteId));
    } else {
      setSelectedSites([...selectedSites, siteId]);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    await saveSites(orgId);
    setLoading(false);
    // onClose(); // close modal after saving
  };

  console.log(availableSites);
  

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Select Sites</DialogTitle>
        </DialogHeader>

        {/* Do not render list if no sites fetched yet */}
        {!allOrgSites || allOrgSites.length === 0 ? (
          <p className="text-sm text-muted-foreground">No sites available.</p>
        ) : (
          <div className="flex flex-col gap-2 max-h-60 overflow-y-auto mt-2">
            {allOrgSites.map((site) => (
              <div key={site.site_id} className="flex items-center gap-2">
                <Checkbox
                  id={site.site_id}
                  checked={selectedSites.includes(site.site_id)}
                  onCheckedChange={() => handleToggleSite(site.site_id)}
                />
                <Label htmlFor={site.id}>{site.site_details.site_name}</Label>
              </div>
            ))}
          </div>
        )}

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>

          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Sites"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
