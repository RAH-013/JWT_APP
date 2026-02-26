import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children }) {
  const token = sessionStorage.getItem("jwt_project") || null;
  if (!token) return <Navigate to="/authenticate" />;
  return children;
}
