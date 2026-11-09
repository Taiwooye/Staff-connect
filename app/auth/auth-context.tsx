"use client";

import type { User } from "@supabase/supabase-js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createSupabaseBrowserClient } from "../../lib/supabase/client";
import { isSupabaseConfigured } from "../../lib/supabase/config";

export type AccountType = "client" | "provider";
export type AuthStatus = "loading" | "signed-out" | "signed-in" | "unconfigured";

type AuthContextValue = {
  status: AuthStatus;
  user: User | null;
  accountType: AccountType | null;
  savedProfessionalIds: string[];
  authError: string;
  signOut: () => Promise<boolean>;
  toggleSavedProfessional: (professionalId: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function isAccountType(value: unknown): value is AccountType {
  return value === "client" || value === "provider";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>(
    isSupabaseConfigured() ? "loading" : "unconfigured",
  );
  const [user, setUser] = useState<User | null>(null);
  const [accountType, setAccountType] = useState<AccountType | null>(null);
  const [savedProfessionalIds, setSavedProfessionalIds] = useState<string[]>([]);
  const [authError, setAuthError] = useState("");
  const accountLoadRequest = useRef(0);

  const loadAccount = useCallback(async (nextUser: User | null) => {
    const requestId = ++accountLoadRequest.current;
    if (!nextUser) {
      setUser(null);
      setAccountType(null);
      setSavedProfessionalIds([]);
      setStatus("signed-out");
      setAuthError("");
      return;
    }

    setUser(nextUser);
    setAccountType(null);
    setSavedProfessionalIds([]);
    setAuthError("");
    setStatus("loading");

    try {
      const supabase = createSupabaseBrowserClient();
      if (!supabase) {
        setStatus("unconfigured");
        return;
      }

      const { data: account, error: accountError } = await supabase
        .from("account_profiles")
        .select("account_type")
        .eq("id", nextUser.id)
        .maybeSingle();

      if (requestId !== accountLoadRequest.current) return;
      if (accountError) {
        setAuthError(`Could not load your account type: ${accountError.message}`);
        setAccountType(null);
        setStatus("signed-in");
        return;
      }

      if (!account || !isAccountType(account.account_type)) {
        setAuthError(
          "Your account type is missing. Please contact support before continuing.",
        );
        setAccountType(null);
        setStatus("signed-in");
        return;
      }

      setAccountType(account.account_type);

      if (account.account_type === "client") {
        const { data: saved, error: savedError } = await supabase
          .from("saved_professionals")
          .select("professional_id")
          .eq("user_id", nextUser.id);

        if (requestId !== accountLoadRequest.current) return;
        if (savedError) {
          setAuthError(`Could not load saved profiles: ${savedError.message}`);
          setSavedProfessionalIds([]);
        } else {
          setSavedProfessionalIds(saved.map((item) => item.professional_id));
          setAuthError("");
        }
      } else {
        setSavedProfessionalIds([]);
        setAuthError("");
      }
    } catch (error) {
      if (requestId !== accountLoadRequest.current) return;
      setAuthError(
        error instanceof Error ? error.message : "Could not load your account.",
      );
    }

    if (requestId === accountLoadRequest.current) setStatus("signed-in");
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    let active = true;
    try {
      const supabase = createSupabaseBrowserClient();
      if (!supabase) return;

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        queueMicrotask(() => {
          if (active) void loadAccount(session?.user ?? null);
        });
      });

      return () => {
        active = false;
        subscription.unsubscribe();
      };
    } catch (error) {
      const message =
        error instanceof Error
          ? `Could not initialize authentication: ${error.message}`
          : "Could not initialize authentication.";
      queueMicrotask(() => {
        if (!active) return;
        setAuthError(message);
        setStatus("signed-out");
      });
      return () => {
        active = false;
      };
    }
  }, [loadAccount]);

  const signOut = useCallback(async () => {
    try {
      const supabase = createSupabaseBrowserClient();
      if (!supabase) {
        setAuthError("Authentication is not configured.");
        return false;
      }

      const { error } = await supabase.auth.signOut();
      if (error) {
        setAuthError(`Could not sign out: ${error.message}`);
        return false;
      }

      await loadAccount(null);
      return true;
    } catch (error) {
      setAuthError(
        error instanceof Error ? `Could not sign out: ${error.message}` : "Could not sign out.",
      );
      return false;
    }
  }, [loadAccount]);

  const toggleSavedProfessional = useCallback(
    async (professionalId: string) => {
      if (!user || accountType !== "client") {
        throw new Error("Sign in with a Client account to save professional profiles.");
      }

      const supabase = createSupabaseBrowserClient();
      if (!supabase) {
        throw new Error("Authentication is not configured.");
      }

      const isSaved = savedProfessionalIds.includes(professionalId);
      const result = isSaved
        ? await supabase
            .from("saved_professionals")
            .delete()
            .eq("user_id", user.id)
            .eq("professional_id", professionalId)
        : await supabase.from("saved_professionals").insert({
            user_id: user.id,
            professional_id: professionalId,
          });

      if (result.error) {
        const message = `Could not ${isSaved ? "remove" : "save"} this profile: ${result.error.message}`;
        setAuthError(message);
        throw new Error(message);
      }

      setSavedProfessionalIds((current) =>
        isSaved
          ? current.filter((id) => id !== professionalId)
          : [...current, professionalId],
      );
      setAuthError("");
    },
    [accountType, savedProfessionalIds, user],
  );

  const value = useMemo(
    () => ({
      status,
      user,
      accountType,
      savedProfessionalIds,
      authError,
      signOut,
      toggleSavedProfessional,
    }),
    [
      status,
      user,
      accountType,
      savedProfessionalIds,
      authError,
      signOut,
      toggleSavedProfessional,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
