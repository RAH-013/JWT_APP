import { Navigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import Loader from "../layouts/Loader";

export default function PrivateRoute({ children }) {
  const { user, loading } = useUser();

  if (loading) return <Loader />;

  if (!user) return <Navigate to="/authenticate" replace />;

  return children;
}