import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import type { User } from '../types'

interface AuthCtxType {
  user: User | null;
  setUser: (u: User | null) => void;
  isLogin: boolean;
}

const AuthContext = createContext<AuthCtxType | null>(null);

// 从 localStorage 恢复登录态，避免刷新后 token 还在但页面显示未登录
function readUser(): User | null {
  const raw = localStorage.getItem("user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    localStorage.removeItem("user");
    return null;
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<User | null>(readUser);

  const setUser = (u: User | null) => {
    setUserState(u);
    if (u) localStorage.setItem("user", JSON.stringify(u));
    else localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, setUser, isLogin: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth 必须包裹在 AuthProvider 内");
  return ctx;
};
