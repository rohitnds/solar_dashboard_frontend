import { create } from "zustand";

export const useUnitStore = create((set) => ({
  loading: false,
  units:[],
  error: null,

  fetchUnits: async (siteId) => {
    set({ loading: true, error: null });

    try {
      const res = await fetch(
        `/api/sites/${siteId}/units/list`
      );

      const json = await res.json();

      set({
        units: json.site_id,
        loading: false,
      });
    } catch (err) {
      set({
        error: err.message,
        loading: false,
      });
    }
  },
}));
