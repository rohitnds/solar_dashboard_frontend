import { create } from "zustand";
import { apiGet } from "@/lib/api";

const useIntegrationStore = create((set, get) => ({
  integrations: [],
  selectedIntegrations: [],
  availableIntegrations: [],
  isLoading: false,
  error: null,

  // Set integrations manually
  setIntegrations: (data) => set({ integrations: data }),

  // Fetch list of integrations
  fetchIntegrations: async () => {
    try {
      set({ isLoading: true, error: null });

      const res = await apiGet("/api/integrations/list", {}, true);

      if (res?.integrations) {
        set({ integrations: res.integrations });
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      set({ error: err.message });
    } finally {
      set({ isLoading: false });
    }
  },

  // ⭐ NEW: Fetch available org integrations
  fetchAvailableIntegrations: async () => {
try {
      set({ isLoading: true, error: null });

      const res = await apiGet("/api/integrations/org-integrations", {}, true);

      if (Array.isArray(res?.org_integrations)) {
        // store full objects
        set({ availableIntegrations: res.org_integrations });
      } else {
        throw new Error("Invalid response format for org_integrations");
      }

    } catch (err) {
      set({ error: err.message });
    } finally {
      set({ isLoading: false });
    }
  },

  // Selected Integrations (input fields)
  addSelectedIntegration: (data) =>
    set((state) => ({
      selectedIntegrations: [...state.selectedIntegrations, data],
    })),

  updateSelectedIntegration: (id, updatedData) =>
    set((state) => ({
      selectedIntegrations: state.selectedIntegrations.map((item) =>
        item.id === id ? { ...item, ...updatedData } : item
      ),
    })),

  removeSelectedIntegration: (id) =>
    set((state) => ({
      selectedIntegrations: state.selectedIntegrations.filter(
        (item) => item.id !== id
      ),
    })),

  // Find available integration by code
  getIntegrationByCode: (code) =>
    get().integrations.find((item) => item.integration_code === code),

  // Find available integration by ID
  getIntegrationById: (id) =>
    get().integrations.find((item) => item.integration_id === id),
}));

export default useIntegrationStore;
