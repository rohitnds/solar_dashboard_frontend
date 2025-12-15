import { create } from "zustand";
import { apiGet } from "@/lib/api"; // <-- your API helper

const useOrgStore = create((set, get) => ({
  org: null,

  // ✔ Save org locally
  setOrg: (data) => {
    set({ org: data });
  },

  // ✔ Check login
  checkOrg: () => {
    return get().org !== null;
  },

  // ✔ Remove org
  removeOrg: () => {
    set({ org: null });
  },

  // ⭐ NEW: Fetch org data from backend
  getOrgInfo: async () => {
    try {
      const response = await apiGet("/api/org/info");

      const org = response?.data?.org ?? null;

      if (org) {
        set({ org });
      }

      return org;
    } catch (error) {
      console.error("Error fetching org info:", error);
      return null;
    }
  },
}));

export default useOrgStore;
