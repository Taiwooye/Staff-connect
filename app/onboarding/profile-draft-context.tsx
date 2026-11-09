"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

export type HouseholdProfileDraft = {
  displayName: string;
  state: string;
  area: string;
  needs: string[];
  arrangement: string;
  budget: string;
  startTiming: string;
};

export type ProfileImage = {
  name: string;
  dataUrl: string;
};

export type ProviderProfileDraft = {
  displayName: string;
  state: string;
  area: string;
  skills: string[];
  arrangements: string[];
  experience: string;
  availability: string;
  salary: string;
  bio: string;
  qualifications: string[];
  languages: string[];
  interests: string[];
  profilePhoto: ProfileImage | null;
  galleryImages: ProfileImage[];
};

type ProfileDraftContextValue = {
  householdProfile: HouseholdProfileDraft | null;
  providerProfile: ProviderProfileDraft | null;
  providerProfileSaved: boolean;
  saveHouseholdProfile: (profile: HouseholdProfileDraft) => void;
  saveProviderProfile: (profile: ProviderProfileDraft) => void;
  markProviderProfileSaved: () => void;
};

const ProfileDraftContext = createContext<ProfileDraftContextValue | null>(null);

export function ProfileDraftProvider({ children }: { children: React.ReactNode }) {
  const [householdProfile, setHouseholdProfile] = useState<HouseholdProfileDraft | null>(
    null,
  );
  const [providerProfile, setProviderProfile] = useState<ProviderProfileDraft | null>(
    null,
  );
  const [providerProfileSaved, setProviderProfileSaved] = useState(false);
  const saveProviderProfile = useCallback((profile: ProviderProfileDraft) => {
    setProviderProfile(profile);
    setProviderProfileSaved(false);
  }, []);

  const markProviderProfileSaved = useCallback(() => {
    setProviderProfileSaved(true);
  }, []);

  const value = useMemo(
    () => ({
      householdProfile,
      providerProfile,
      providerProfileSaved,
      saveHouseholdProfile: setHouseholdProfile,
      saveProviderProfile,
      markProviderProfileSaved,
    }),
    [
      householdProfile,
      providerProfile,
      providerProfileSaved,
      saveProviderProfile,
      markProviderProfileSaved,
    ],
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
