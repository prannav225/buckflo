/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, X } from "lucide-react";
import { useProfile } from "../hooks/useProfile";
import toast from "react-hot-toast";
import { BrandedAvatar } from "../components/layout/BrandedAvatar";
import { cleanDisplayName } from "../utils/validation";

export function EditProfilePage() {
  const navigate = useNavigate();
  const { profile, updateProfile } = useProfile();

  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (profile?.displayName) {
      setName(profile.displayName);
    }
  }, [profile]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(cleanDisplayName(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter a name.");
      return;
    }
    setSubmitting(true);
    try {
      await updateProfile({
        displayName: name,
      });
      toast.success("Profile updated successfully!");
      navigate("/profile");
    } catch (err) {
      console.error("Failed to update profile:", err);
      toast.error("Failed to update profile.");
    } finally {
      setSubmitting(false);
    }
  };

  const avatarName = name.trim() || "flo";

  return (
    <>
      {/* Header */}
      <div className="sub-header p-0! fade-in-up flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <button
            className="p-0 min-h-0 h-auto flex text-(--text-muted) hover:text-(--text) cursor-pointer bg-transparent border-0 outline-none"
            onClick={() => navigate("/profile")}
            title="Back to profile"
            id="edit-profile-btn-back"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="sub-header-title m-0">Edit Profile</h2>
        </div>
      </div>

      <div className="flex flex-col gap-6 fade-in-up delay-1">
        {/* Avatar Live Preview */}
        <div className="flex flex-col items-center justify-center py-4">
          <BrandedAvatar
            name={avatarName}
            size={80}
            className="shadow-md"
          />
          <span className="text-[11px] text-(--text-muted) mt-2.5 uppercase tracking-wider font-semibold">
            Avatar Preview
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Display Name Input */}
          <div className="form-group">
            <label htmlFor="edit-name-input" className="label">
              Display Name
            </label>
            <input
              id="edit-name-input"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={handleNameChange}
              className="input-field font-medium"
              maxLength={20}
              required
            />
          </div>

          {/* Locked Currency Field */}
          <div className="form-group">
            <label htmlFor="edit-currency-input" className="label">
              Currency
            </label>
            <input
              id="edit-currency-input"
              type="text"
              value="INR (₹)"
              disabled
              className="input-field bg-black/5 dark:bg-white/5 border-dashed text-(--text-muted) font-medium cursor-not-allowed select-none"
            />
            <span className="text-[10px] text-(--text-muted) mt-1 px-1">
              More currencies coming soon.
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="btn-secondary flex-1 py-3.5 text-xs flex items-center justify-center gap-1.5 outline-none border-none"
              id="edit-profile-btn-cancel"
            >
              <X size={15} /> Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !name.trim()}
              className="btn-primary flex-1 py-3.5 text-xs flex items-center justify-center gap-1.5 outline-none border-none"
              id="edit-profile-btn-save"
            >
              <Check size={15} /> Save
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
