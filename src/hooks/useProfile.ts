/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import { db, type Profile } from "../db/database";

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const p = await db.profile.get(1);
      if (p) {
        setProfile(p);
      } else {
        setProfile(null);
      }
    } catch (e) {
      console.error("Failed to fetch profile:", e);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const updateProfile = async (
    partial: Partial<Omit<Profile, "id" | "createdAt">>,
  ) => {
    const now = new Date();
    let updated: Profile;

    if (profile) {
      updated = {
        ...profile,
        ...partial,
        updatedAt: now,
      } as Profile;
    } else {
      updated = {
        id: 1,
        displayName: "",
        currency: "INR",
        currencySymbol: "₹",
        theme: "system",
        createdAt: now,
        updatedAt: now,
        ...partial,
      } as Profile;
    }

    await db.profile.put(updated);
    setProfile(updated);
    window.dispatchEvent(
      new CustomEvent("flo_profile_updated", { detail: updated }),
    );
  };

  const resetProfile = async () => {
    await db.profile.delete(1);
    setProfile(null);
    window.dispatchEvent(
      new CustomEvent("flo_profile_updated", { detail: null }),
    );
  };

  const profileExists = (): boolean => {
    return profile !== null && profile !== undefined;
  };

  // Sync state between different useProfile hooks in different components
  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setProfile(detail);
    };
    window.addEventListener("flo_profile_updated", handleUpdate);
    return () => {
      window.removeEventListener("flo_profile_updated", handleUpdate);
    };
  }, []);

  return {
    profile: profile ?? null,
    updateProfile,
    isLoading,
    resetProfile,
    profileExists,
  };
}
