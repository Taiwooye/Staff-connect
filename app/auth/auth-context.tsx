"use client";

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

type AccountUser = {
  id: string;
  email: string;
};

type DemoAccount = {
  email: string;
  displayName: string;
  accountType: AccountType;
  profile?: AccountProfile;
};

export type AccountProfile = {
  displayName: string;
  photoDataUrl: string;
  phone: string;
  stateOfOrigin: string;
  state: string;
  area: string;
  bio: string;
  experienceYears: string;
  previousWork: string;
  skills: string[];
  qualifications: string;
  languages: string;
  arrangements: string[];
  availability: string;
  expectedSalary: string;
  serviceNeeds: string[];
  workArrangement: string;
  monthlyBudget: string;
  startTiming: string;
};

function createEmptyProfile(displayName: string): AccountProfile {
  return {
    displayName,
    photoDataUrl: "",
    phone: "",
    stateOfOrigin: "",
    state: "",
    area: "",
    bio: "",
    experienceYears: "",
    previousWork: "",
    skills: [],
    qualifications: "",
    languages: "",
    arrangements: [],
    availability: "",
    expectedSalary: "",
    serviceNeeds: [],
    workArrangement: "",
    monthlyBudget: "",
    startTiming: "",
  };
}

const DEMO_SESSION_KEY = "staffconnect.demo.session";
const DEMO_ACCOUNTS_KEY = "staffconnect.demo.accounts";
const DEMO_SAVED_PREFIX = "staffconnect.demo.saved.";
const PROFILE_PREFIX = "staffconnect.profile.";

type AuthContextValue = {
  status: AuthStatus;
  user: AccountUser | null;
  accountType: AccountType | null;
  savedProfessionalIds: string[];
  authError: string;
  demoMode: boolean;
  profile: AccountProfile | null;
  saveProfile: (profile: AccountProfile) => void;
  startDemoSession: (
    email: string,
    accountType: AccountType,
    displayName: string,
  ) => void;
  signOut: () => Promise<boolean>;
  toggleSavedProfessional: (professionalId: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function isAccountType(value: unknown): value is AccountType {
  return value === "client" || value === "provider";
}

function getDemoAccounts(): Record<string, DemoAccount> {
  const rawAccounts = window.localStorage.getItem(DEMO_ACCOUNTS_KEY);
  if (!rawAccounts) return {};

  const accounts: unknown = JSON.parse(rawAccounts);
  if (!accounts || typeof accounts !== "object" || Array.isArray(accounts)) {
    throw new Error("Your demo accounts could not be read. Clear this site’s local storage and try again.");
  }

  const demoAccounts: Record<string, DemoAccount> = {};
  for (const [email, value] of Object.entries(accounts)) {
    if (!isDemoAccount(value)) {
      throw new Error("A demo account could not be read. Clear this site’s local storage and try again.");
    }
    demoAccounts[email] = value;
  }
  return demoAccounts;
}

function isDemoAccount(value: unknown): value is DemoAccount {
  if (!value || typeof value !== "object") return false;
  const account = value as Partial<DemoAccount>;
  return (
    typeof account.email === "string" &&
    typeof account.displayName === "string" &&
    isAccountType(account.accountType) &&
    (account.profile === undefined || isAccountProfile(account.profile))
  );
}

function isAccountProfile(value: unknown): value is AccountProfile {
  if (!value || typeof value !== "object") return false;
  const profile = value as Partial<AccountProfile>;
  return (
    typeof profile.displayName === "string" &&
    typeof profile.photoDataUrl === "string" &&
    typeof profile.phone === "string" &&
    typeof profile.stateOfOrigin === "string" &&
    typeof profile.state === "string" &&
    typeof profile.area === "string" &&
    typeof profile.bio === "string" &&
    typeof profile.experienceYears === "string" &&
    typeof profile.previousWork === "string" &&
    Array.isArray(profile.skills) &&
    profile.skills.every((item) => typeof item === "string") &&
    typeof profile.qualifications === "string" &&
    typeof profile.languages === "string" &&
    Array.isArray(profile.arrangements) &&
    profile.arrangements.every((item) => typeof item === "string") &&
    typeof profile.availability === "string" &&
    typeof profile.expectedSalary === "string" &&
    Array.isArray(profile.serviceNeeds) &&
    profile.serviceNeeds.every((item) => typeof item === "string") &&
    typeof profile.workArrangement === "string" &&
    typeof profile.monthlyBudget === "string" &&
    typeof profile.startTiming === "string"
  );
}

function getStoredProfile(userId: string, displayName: string) {
  const rawProfile = window.localStorage.getItem(
    `${PROFILE_PREFIX}${encodeURIComponent(userId)}`,
  );
  if (!rawProfile) return createEmptyProfile(displayName);

  const profile: unknown = JSON.parse(rawProfile);
  if (!isAccountProfile(profile)) {
    throw new Error("Your saved profile could not be read from this browser.");
  }

  return profile;
}

function getDemoSavedProfiles(email: string): string[] {
  const rawIds = window.localStorage.getItem(
    `${DEMO_SAVED_PREFIX}${encodeURIComponent(email)}`,
  );
  if (!rawIds) return [];

  const ids: unknown = JSON.parse(rawIds);
  if (!Array.isArray(ids) || !ids.every((id) => typeof id === "string")) {
    throw new Error("Your saved profiles could not be read from this browser.");
  }

  return ids;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<AccountUser | null>(null);
  const [accountType, setAccountType] = useState<AccountType | null>(null);
  const [savedProfessionalIds, setSavedProfessionalIds] = useState<string[]>([]);
  const [authError, setAuthError] = useState("");
  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const accountLoadRequest = useRef(0);
  const demoMode = !isSupabaseConfigured();

  const loadAccount = useCallback(async (nextUser: {
    id: string;
    email?: string;
    user_metadata?: Record<string, unknown>;
  } | null) => {
    const requestId = ++accountLoadRequest.current;
    if (!nextUser) {
      setUser(null);
      setAccountType(null);
      setSavedProfessionalIds([]);
      setProfile(null);
      setStatus("signed-out");
      setAuthError("");
      return;
    }

    setUser({ id: nextUser.id, email: nextUser.email ?? "" });
    setAccountType(null);
    setSavedProfessionalIds([]);
    setAuthError("");
    setStatus("loading");

    try {
      const emailName = nextUser.email?.split("@")[0] ?? "";
      const metadataName =
        typeof nextUser.user_metadata?.display_name === "string"
          ? nextUser.user_metadata.display_name
          : "";
      setProfile(getStoredProfile(nextUser.id, metadataName || emailName));

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
    if (!isSupabaseConfigured()) {
      let active = true;
      queueMicrotask(() => {
        if (!active) return;
        try {
          const rawSession = window.localStorage.getItem(DEMO_SESSION_KEY);
          if (!rawSession) {
            setStatus("signed-out");
            return;
          }

          const session: unknown = JSON.parse(rawSession);
          if (!isDemoAccount(session)) {
            throw new Error("Your demo session could not be read. Sign in again to continue.");
          }

          const userId = `demo:${session.email}`;
          setUser({ id: userId, email: session.email });
          setAccountType(session.accountType);
          setProfile(session.profile ?? createEmptyProfile(session.displayName));
          setSavedProfessionalIds(
            session.accountType === "client"
              ? getDemoSavedProfiles(session.email)
              : [],
          );
          setStatus("signed-in");
        } catch (error) {
          setAuthError(
            error instanceof Error ? error.message : "Could not restore your demo session.",
          );
          setStatus("signed-out");
        }
      });

      return () => {
        active = false;
      };
    }

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

  const startDemoSession = useCallback(
    (emailValue: string, selectedAccountType: AccountType, displayName: string) => {
      if (!demoMode) {
        throw new Error("Demo sign-in is unavailable while Supabase is configured.");
      }

      const email = emailValue.trim().toLowerCase();
      const accounts = getDemoAccounts();
      const existingAccount = accounts[email];
      const demoAccount =
        existingAccount ??
        ({
          email,
          displayName: displayName.trim(),
          accountType: selectedAccountType,
          profile: createEmptyProfile(displayName.trim()),
        } satisfies DemoAccount);
      demoAccount.profile ??= createEmptyProfile(demoAccount.displayName);
      accounts[email] = demoAccount;
      window.localStorage.setItem(DEMO_ACCOUNTS_KEY, JSON.stringify(accounts));
      window.localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(demoAccount));

      setUser({ id: `demo:${email}`, email });
      setAccountType(demoAccount.accountType);
      setProfile(demoAccount.profile);
      setSavedProfessionalIds(
        demoAccount.accountType === "client" ? getDemoSavedProfiles(email) : [],
      );
      setAuthError("");
      setStatus("signed-in");
    },
    [demoMode],
  );

  const saveProfile = useCallback(
    (nextProfile: AccountProfile) => {
      if (!user || !accountType) {
        throw new Error("Sign in before saving your profile.");
      }

      if (!isSupabaseConfigured()) {
        const accounts = getDemoAccounts();
        const account = accounts[user.email];
        if (!account) {
          throw new Error("Your demo account could not be found in this browser.");
        }

        const updatedAccount = { ...account, profile: nextProfile };
        accounts[user.email] = updatedAccount;
        window.localStorage.setItem(DEMO_ACCOUNTS_KEY, JSON.stringify(accounts));
        window.localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(updatedAccount));
      } else {
        window.localStorage.setItem(
          `${PROFILE_PREFIX}${encodeURIComponent(user.id)}`,
          JSON.stringify(nextProfile),
        );
      }

      setProfile(nextProfile);
      setAuthError("");
    },
    [accountType, user],
  );

  const signOut = useCallback(async () => {
    try {
      if (!isSupabaseConfigured()) {
        window.localStorage.removeItem(DEMO_SESSION_KEY);
        setUser(null);
        setAccountType(null);
        setSavedProfessionalIds([]);
        setProfile(null);
        setAuthError("");
        setStatus("signed-out");
        return true;
      }

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

      const isSaved = savedProfessionalIds.includes(professionalId);
      if (!isSupabaseConfigured()) {
        const savedIds = isSaved
          ? savedProfessionalIds.filter((id) => id !== professionalId)
          : [...savedProfessionalIds, professionalId];
        window.localStorage.setItem(
          `${DEMO_SAVED_PREFIX}${encodeURIComponent(user.email)}`,
          JSON.stringify(savedIds),
        );
        setSavedProfessionalIds(savedIds);
        setAuthError("");
        return;
      }

      const supabase = createSupabaseBrowserClient();
      if (!supabase) {
        throw new Error("Could not connect to your account. Please try again.");
      }

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
      demoMode,
      profile,
      saveProfile,
      startDemoSession,
      signOut,
      toggleSavedProfessional,
    }),
    [
      status,
      user,
      accountType,
      savedProfessionalIds,
      authError,
      demoMode,
      profile,
      saveProfile,
      startDemoSession,
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
