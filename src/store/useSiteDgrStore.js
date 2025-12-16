import { create } from "zustand";

export const useSiteDgrStore = create((set, get) => ({
  loading: false,
  error: null,
  rows: [],
  totalDays: 10,
  pageIndex: 0,
  pageSize: 10,
  from: null,
  to: null,

  fetchSiteDgr: async ({ siteId, from = 1762194600, to = 1765391400, page = 0, per = 10 }) => {
    set({ loading: true, error: null, pageIndex: page, pageSize: per, from, to });

    try {
        console.log("from", from);
        
      const fromDate = new Date(from * 1000);
      const toDate = new Date(to * 1000);
      const totalDays = Math.ceil((toDate - fromDate) / (1000 * 60 * 60 * 24)) + 1;
        console.log("url",`/api/sites/${siteId}/dgr?from=${from}&to=${to}&page=${page + 1}&per=${per}`)
      const res = await fetch(
        `/api/sites/${siteId}/dgr?from=${from}&to=${to}&page=${page + 1}&per=${per}`
      );
      const json = await res.json();

      // Append new rows if page > 0, else replace
      set((state) => ({
        rows: json.dgr_data || [],
        totalDays,
        loading: false,
      }));
    } catch (err) {
      set({
        error: err.message,
        loading: false,
      });
    }
  },

  nextPage: ({ siteId }) => {
    const { pageIndex, pageSize, from, to } = get();
    const nextPageIndex = pageIndex + 1;
    set({ pageIndex: nextPageIndex });
    get().fetchSiteDgr({ siteId, from, to, page: nextPageIndex, per: pageSize });
  },

  prevPage: ({ siteId }) => {
    const { pageIndex, pageSize, from, to } = get();
    if (pageIndex > 0) {
      const prevPageIndex = pageIndex - 1;
      set({ pageIndex: prevPageIndex });
      get().fetchSiteDgr({ siteId, from, to, page: prevPageIndex, per: pageSize });
    }
  },

  setPageSize: ({ siteId, newSize }) => {
    set({ pageSize: newSize, pageIndex: 0 });
    const { from, to } = get();
    get().fetchSiteDgr({ siteId, from, to, page: 0, per: newSize });
  },

  // ✅ New action: initialize default range for last 7 days
initializeDefaultRange: ({ siteId }) => {
  const today = new Date();
  today.setHours(23, 59, 59, 999); // end of today
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0); // start of 7 days ago

  console.log("lastRange", JSON.stringify({ from: sevenDaysAgo, to: today }));

  const fromUnix = Math.floor(sevenDaysAgo.getTime() / 1000);
  const toUnix = Math.floor(today.getTime() / 1000);

  set({ from: fromUnix, to: toUnix, pageIndex: 0 });

  get().fetchSiteDgr({
    siteId,
    from: fromUnix,
    to: toUnix,
    page: 0,
    per: get().pageSize,
  });
}
}));
