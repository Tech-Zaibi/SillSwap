import { createContext, useCallback, useContext, useState } from 'react';
import * as auth from '../services/authService.js';

const AuthContext = createContext(null);

// Holds "who is logged in" for the whole app.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => auth.getCurrentUser());
  const [tick, setTick] = useState(0); // changes after each action so the navbar re-reads balance + notifications

  // Re-read the user from storage (balances may have changed).
  const refresh = useCallback(async () => {
    setUser(auth.getCurrentUser());
    setTick((t) => t + 1);
  }, []);

  const login = async (email, password) => { const u = await auth.login(email, password); setUser(u); return u; };
  const register = async (data) => { const u = await auth.register(data); setUser(u); return u; };
  const loginAs = async (id) => setUser(await auth.loginAs(id));
  const logout = () => { auth.logout(); setUser(null); };

  return (
    <AuthContext.Provider value={{ user, tick, refresh, login, register, loginAs, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
