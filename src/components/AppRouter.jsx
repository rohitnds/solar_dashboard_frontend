import ForgotPassword from "@/pages/(auth)/ForgotPassword";
import Login from "@/pages/(auth)/Login";
import ResetPassword from "@/pages/(auth)/ResetPassword";
import Signup from "@/pages/(auth)/Signup";
import Home from "@/pages/(dashboard)/Home";
import AuthRoute from "@/components/AuthRoute";
import ProtectedRoute from "@/components/ProtectedRoute";

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import VerifyEmailPage from "@/pages/(auth)/VerifyEmailPage";
import DashboardLayout from "./DashboardLayout";
import Onboarding from "@/pages/(onboarding)/onboarding";
import ComingSoon from "@/pages/(dashboard)/ComingSoon";
import SitePage from "@/pages/(dashboard)/Site";

const router = createBrowserRouter([

  // AUTH ROUTES (no login required)
  {
    element: <AuthRoute />,
    children: [
      { path: "/login", element: <Login /> },
      { path: "/signup", element: <Signup /> },
      { path: "/forgot-password", element: <ForgotPassword /> },
      { path: "/reset-password", element: <ResetPassword /> },
       { path: "/onboarding", element: <Onboarding /> },
    ]
  },

  // VERIFICATION PAGE (accessible only when logged-in but not verified)
  {
    path: "/verify-email",
    element: <VerifyEmailPage /> // <-- Create this page
  },

  // PROTECTED ROUTES (login + verified required)
   {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: (
          <DashboardLayout title="Fleet Overview">
            <Home />
          </DashboardLayout>
        ),
      },

      {
        path: "/site/:siteId",
        element: (
          <DashboardLayout title="Comming soon">
            <SitePage />
          </DashboardLayout>
        ),
      },
    ],
  },

]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
