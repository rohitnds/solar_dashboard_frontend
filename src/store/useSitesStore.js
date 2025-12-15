import { create } from "zustand";
import { apiGet, apiPatch } from "@/lib/api";

const useSitesStore = create((set, get) => ({
  availableSites: [],       // sites for current org
  selectedSites: [],        // currently selected sites
  allOrgSites: [],          // all orgs available sites
  isLoading: false,
  error: null,

  // Fetch sites for a specific org
  fetchSites: async (orgId) => {
    try {
      set({ isLoading: true, error: null });
      const res = await apiGet(`/api/integrations/${orgId}/site-list`);
      if (Array.isArray(res.site_data)) {
        set({ allOrgSites: res.site_data });
      } else {
        throw new Error("Invalid site list format");
      }
    } catch (err) {
      set({ error: err.message });
    } finally {
      set({ isLoading: false });
    }
  },

  // Fetch all available sites across orgs
  fetchAllAvailableSites: async () => {
    try {
      set({ isLoading: true, error: null });
      const res = await apiGet("/api/sites/list?active=true&inactive=true");
        set({ availableSites: res.sites });
    } catch (err) {
      set({ error: err.message });
    } finally {
      set({ isLoading: false });
    }
  },

  // Set selected sites manually
  setSelectedSites: (sites) => set({ selectedSites: sites }),

  // Save selected sites
  saveSites: async (orgId) => {
    try {
      set({ isLoading: true, error: null });
      const { availableSites, selectedSites } = get();

// Extract available IDs
const activeAvail = availableSites?.active ?? [];
const inactiveAvail = availableSites?.inactive ?? [];

const availableIds = [
  ...activeAvail.map(s => s.site_id),
  ...inactiveAvail.map(s => s.site_id),
];

// ADD → selected but not available
const add = selectedSites.filter(id => !availableIds.includes(id));

// REMOVE → available but not selected
const remove = availableIds.filter(id => !selectedSites.includes(id));


      const payload = { add, remove };
      await apiPatch(`/api/integrations/${orgId}/save-sites`, payload);

      // Update store to reflect changes
      set({ availableSites: selectedSites });
      return payload; // optional, for confirmation
    } catch (err) {
      set({ error: err.message });
      console.error("Failed to save sites:", err);
      return null;
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useSitesStore;
