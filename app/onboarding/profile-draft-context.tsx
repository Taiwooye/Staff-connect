"use client";

import { createContext, useContext, useMemo, useState } from "react";

export type HouseholdProfileDraft = {
  displayName: string;
  area: string;
  needs: string[];
  arrangement: string;
  budget: string;
  startTiming: string;
};

export type ProviderProfileDraft = {
  displayName: string;
  area: string;
  skills: string[];
  arrangements: string[];
  experience: string;
  availability: string;
  salary: string;
  bio: string;
};

type ProfileDraftContextValue = {
  householdProfile: HouseholdProfileDraft | null;
  providerProfile: ProviderProfileDraft | null;
  saveHouseholdProfile: (profile: HouseholdProfileDraft) => void;
  saveProviderProfile: (profile: ProviderProfileDraft) => void;
};

const ProfileDraftContext = createContext<ProfileDraftContextValue | null>(null);

export function ProfileDraftProvider({ children }: { children: React.ReactNode }) {
  const [householdProfile, setHouseholdProfile] = useState<HouseholdProfileDraft | null>(
    null,
  );
  const [providerProfile, setProviderProfile] = useState<ProviderProfileDraft | null>(
    null,
  );

  const value = useMemo(
    () => ({
      householdProfile,
      providerProfile,
      saveHouseholdProfile: setHouseholdProfile,
      saveProviderProfile: setProviderProfile,
    }),
    [householdProfile, providerProfile],
  );

  return <ProfileDraftContext.Provider value={value}>{children}</ProfileDraftContext.Provider>;
}

export function useProfileDraft() {
  const context = useContext(ProfileDraftContext);

  if (!context) {
    throw new Error("useProfileDraft must be used within a ProfileDraftProvider");
  }

  return context;
}
