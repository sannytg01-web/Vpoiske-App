import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Onboarding } from "./pages/Onboarding";
import { ConsentForm } from "./pages/ConsentForm";
import { useAuthStore } from "./store/authStore";
import { BirthDataForm } from "./pages/BirthDataForm";
import { HDCard } from "./pages/HDCard";
import { Matches } from "./pages/Matches";
import { MatchDetail } from "./pages/MatchDetail";
import { Chat } from "./pages/Chat";
import { Paywall } from "./pages/Paywall";
import { Profile } from "./pages/Profile";
import { DataExport } from "./pages/DataExport";
import { DeleteAccount } from "./pages/DeleteAccount";
import { AdminPanel } from "./pages/AdminPanel";
import { CreateProfile } from "./pages/CreateProfile";

import { Interview } from "./pages/Interview";

export const AppRouter: React.FC = () => {
  const isAuth = useAuthStore((s) => s.isAuthenticated);
  const hasCompletedInterview = useAuthStore((s) => s.hasCompletedInterview);
  const hasCompletedBirthData = useAuthStore((s) => s.hasCompletedBirthData);

  const getInitialRoute = () => {
    if (localStorage.getItem('vpoiske_is_admin') === 'true') return "/admin";
    if (!isAuth) return "/onboarding";
    if (!hasCompletedInterview) return "/consent";
    if (!hasCompletedBirthData) return "/birth-data";
    return "/matches";
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/onboarding"
          element={
            !isAuth ? <Onboarding /> : <Navigate to={getInitialRoute()} replace />
          }
        />

        {/* Protected routes */}
        <Route
          path="/consent"
          element={
            isAuth ? <ConsentForm /> : <Navigate to="/onboarding" replace />
          }
        />
        <Route
          path="/create-profile"
          element={
            isAuth ? <CreateProfile /> : <Navigate to="/onboarding" replace />
          }
        />
        <Route
          path="/interview"
          element={
            isAuth ? <Interview /> : <Navigate to="/onboarding" replace />
          }
        />
        <Route
          path="/birth-data"
          element={
            isAuth ? <BirthDataForm /> : <Navigate to="/onboarding" replace />
          }
        />
        <Route
          path="/hd-card"
          element={isAuth ? <HDCard /> : <Navigate to="/onboarding" replace />}
        />
        <Route
          path="/matches"
          element={isAuth ? <Matches /> : <Navigate to="/onboarding" replace />}
        />
        <Route
          path="/matches/:id"
          element={
            isAuth ? <MatchDetail /> : <Navigate to="/onboarding" replace />
          }
        />
        <Route
          path="/chat/:matchId"
          element={isAuth ? <Chat /> : <Navigate to="/onboarding" replace />}
        />
        <Route
          path="/paywall"
          element={isAuth ? <Paywall /> : <Navigate to="/onboarding" replace />}
        />
        <Route
          path="/profile"
          element={isAuth ? <Profile /> : <Navigate to="/onboarding" replace />}
        />
        <Route
          path="/data-export"
          element={isAuth ? <DataExport /> : <Navigate to="/onboarding" replace />}
        />
        <Route
          path="/delete-account"
          element={isAuth ? <DeleteAccount /> : <Navigate to="/onboarding" replace />}
        />
        <Route
          path="/admin"
          element={isAuth ? <AdminPanel /> : <Navigate to="/onboarding" replace />}
        />

        {/* Home rewrite wrapper logic, redirecting dynamically based on auth status */}
        <Route
          path="/"
          element={<Navigate to={getInitialRoute()} replace />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
