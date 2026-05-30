import React, { useState } from "react";
import { useProfile } from "../hooks/useProfile";
import toast from "react-hot-toast";
import { BrandedAvatar } from "../components/layout/BrandedAvatar";
import { cleanDisplayName } from "../utils/validation";

export function ProfileSetupPage() {
  const [name, setName] = useState("");
  const { updateProfile } = useProfile();
  const [submitting, setSubmitting] = useState(false);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(cleanDisplayName(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter a name first.");
      return;
    }
    setSubmitting(true);
    try {
      await updateProfile({
        displayName: name,
        currency: "INR",
        currencySymbol: "₹",
        theme: "system",
      });
      toast.success(`Welcome, ${name}!`);
    } catch (err) {
      console.error("Failed to save profile:", err);
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const avatarName = name.trim() || "buckflo";

  return (
    <div className="fixed inset-0 z-9999 bg-(--bg) flex flex-col items-center justify-center p-6 text-(--text) font-sans animate-fade-in overflow-y-auto">
      {/* Background ambient radial glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-(--accent)/10 dark:bg-(--accent)/12 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-(--credit)/10 dark:bg-(--credit)/12 blur-3xl pointer-events-none" />

      <div className="w-full max-w-[340px] flex flex-col items-center text-center">
        {/* Large Avatar Centered */}
        <BrandedAvatar
          name={avatarName}
          size={96}
          className="shadow-lg mb-8"
        />

        {/* Heading */}
        <h1 className="font-display text-4xl font-bold tracking-tight mb-3 text-(--text)">
          What should we call you?
        </h1>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="w-full flex flex-col gap-4 mt-4"
        >
          <div className="form-group text-left">
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={handleNameChange}
              className="input-field text-center font-semibold text-lg"
              autoFocus
              maxLength={20}
              required
              id="setup-name-input"
            />
          </div>

          {/* Subtext */}
          <p className="font-sans text-[0.8125rem] text-(--text-muted) leading-relaxed mb-4 px-2">
            This personalizes your experience. Stays on your device, always.
          </p>

          {/* Start tracking CTA button */}
          <button
            type="submit"
            disabled={submitting || !name.trim()}
            className="btn-primary w-full py-4 text-base font-bold shadow-lg"
            id="setup-btn-submit"
          >
            {submitting ? "Starting..." : "Start tracking"}
          </button>
        </form>
      </div>
    </div>
  );
}
