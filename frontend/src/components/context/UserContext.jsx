import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

import { apiMe } from "../../api/auth";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = sessionStorage.getItem("jwt_project");

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const me = await apiMe();
      setUser(me);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        refreshUser: loadUser,
        setUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const ctx = useContext(UserContext);

  if (!ctx) {
    throw new Error("useUser must be used within UserProvider");
  }

  return ctx;
};
