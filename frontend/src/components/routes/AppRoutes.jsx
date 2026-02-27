import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { lazy, Suspense } from "react";

import { UserProvider, useUser } from "../context/UserContext";

import Main from "../layouts/Main";
import Loader from "../layouts/Loader";

import PrivateRoute from "./PrivateRoute";

const Auth = lazy(() => import("../pages/Auth"));
const Register = lazy(() => import("../pages/Register"));
const Home = lazy(() => import("../pages/Home"));
const Logs = lazy(() => import("../pages/Logs"));
const NotFound = lazy(() => import("../pages/NotFound"));

function AppContent() {
  const { loading } = useUser();

  if (loading) return <Loader />;

  return (
    <Routes>
      <Route path="/authenticate" element={<Auth />} />
      <Route path="/register" element={<Register />} />

      <Route
        element={
          <PrivateRoute>
            <Main>
              <Outlet />
            </Main>
          </PrivateRoute>
        }
      >
        <Route path="/" element={<Home />} />
        <Route path="/logs" element={<Logs />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <UserProvider>
        <Suspense fallback={<Loader />}>
          <AppContent />
        </Suspense>
      </UserProvider>
    </BrowserRouter>
  );
}