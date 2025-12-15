import { create } from "zustand";
import { persist } from "zustand/middleware";

const useAuthStore = create(
  persist(
    (set, get) => ({
      auth: null, // will hold the JSON object

      // ✔ Set Auth Data after Login
      setAuth: (data) => {
        set({ auth: data });
      },

      // ✔ Check if user is logged in
      checkAuth: () => {
        const auth = get().auth;
        return auth !== null;
      },

      // ✔ Check if user's email is verified
      checkVerify: () => {
        const auth = get().auth;
        if (!auth) return false;
        return auth?.user?.verifiedEmail === true;
      },

      // ✔ Get Org Data
      getOrg: () => {
        const auth = get().auth;
        if (!auth) return false;
        return auth?.org;
      },

      // ✔ Logout (clear all stored data)
      logout: () => {
        set({ auth: null });
      },
      
    }),
    

    {
      name: "solar-auth", // localStorage key name
      getStorage: () => localStorage,
    }
  )
);

export default useAuthStore;
