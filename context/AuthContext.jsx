"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";
import { getUserProfile, loginUser, logoutUser, ensureDefaultAdmin } from "../lib/auth";

const AuthContext = createContext({
  user: null,
  profile: null,
  role: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
  refreshProfile: async () => {}
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (firebaseUser) => {
    if (!firebaseUser) {
      setUser(null);
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      const prof = await getUserProfile(firebaseUser.uid);
      const isSuper = firebaseUser.email?.toLowerCase() === "ahmadraufbd@gmail.com";
      setUser(firebaseUser);
      setProfile(prof || {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        name: isSuper ? "Super Administrator" : (firebaseUser.email.includes("admin") ? "Administrator" : "Candidate"),
        role: isSuper ? "super_admin" : (firebaseUser.email.includes("admin") ? "admin" : "candidate")
      });
    } catch (err) {
      console.error("Profile fetch error:", err);
      setUser(firebaseUser);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Attempt bootstrap of sample tests & admin on first run
    ensureDefaultAdmin().catch(() => {});

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      await fetchProfile(firebaseUser);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    const res = await loginUser(email, password);
    setUser(res.user);
    setProfile(res.profile);
    return res;
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user);
    }
  };

  const isSuper = user?.email?.toLowerCase() === "ahmadraufbd@gmail.com";
  const computedRole = isSuper ? "super_admin" : (profile?.role || (user?.email?.includes("admin") ? "admin" : "candidate"));

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role: computedRole,
        isSuperAdmin: computedRole === "super_admin",
        loading,
        login,
        logout,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
