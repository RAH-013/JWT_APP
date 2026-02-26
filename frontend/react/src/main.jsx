import React from "react";
import ReactDOM from "react-dom/client";

import AppRouter from "./components/routes/AppRoutes";
import "./components/style/index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>,
);
