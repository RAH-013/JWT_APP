import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { lazy, Suspense } from "react";

import Main from "../layouts/Main";
import Loader from "../layouts/Loader";

import PrivateRoute from "./PrivateRoute";

const Auth = lazy(() => import("../pages/Auth"));
const Home = lazy(() => import("../pages/Home"));
const Me = lazy(() => import("../pages/Me"));
const NotFound = lazy(() => import("../pages/NotFound"));

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loader />}>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/authenticate" element={<Auth />} />

          {/* Rutas privadas con layout Main */}
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
            <Route path="/me" element={<Me />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
