"use client";

import type { Session, User } from "@supabase/supabase-js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import { supabase } from "@/lib/supabase/client";
import type { Language, Profile } from "@/lib/types";

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  language: Language;
  setLanguage: (language: Language) => Promise<void>;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [languageState, setLanguageState] = useState<Language>("ja");

  const user = session?.user ?? null;

  const loadProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (!error && data) {
      setProfile(data as Profile);
      setLanguageState((data.preferred_language as Language) || "ja");
      localStorage.setItem("ut_language", data.preferred_language || "ja");
    } else {
      setProfile(null);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      await loadProfile(user.id);
    }
  }, [loadProfile, user?.id]);

  useEffect(() => {
    const savedLanguage = localStorage.getItem("ut_language");
    if (savedLanguage === "ja" || savedLanguage === "en") {
      setLanguageState(savedLanguage);
    }

    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      if (data.session?.user.id) {
        await loadProfile(data.session.user.id);
      }
      setLoading(false);
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (nextSession?.user.id) {
        void loadProfile(nextSession.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [loadProfile]);

  const setLanguage = useCallback(
    async (nextLanguage: Language) => {
      setLanguageState(nextLanguage);
      localStorage.setItem("ut_language", nextLanguage);

      if (profile) {
        const { data } = await supabase
          .from("profiles")
          .update({ preferred_language: nextLanguage })
          .eq("id", profile.id)
          .select("*")
          .single();

        if (data) {
          setProfile(data as Profile);
        }
      }
    },
    [profile]
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
  }, []);

  const value = useMemo(
    () => ({
      session,
      user,
      profile,
      loading,
      language: languageState,
      setLanguage,
      refreshProfile,
      signOut
    }),
    [
      session,
      user,
      profile,
      loading,
      languageState,
      setLanguage,
      refreshProfile,
      signOut
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
