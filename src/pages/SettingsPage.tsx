import { useNavigate } from "react-router-dom";
import { ArrowLeft, Palette, ChevronRight } from "lucide-react";

export function SettingsPage() {
  const navigate = useNavigate();

  return (
    <>
      <div className="sub-header p-0! fade-in-up flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <button
            className="p-0 min-h-0 h-auto flex text-(--text-muted)"
            onClick={() => navigate(-1)}
            title="Back"
            id="btn-back"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="sub-header-title m-0">Settings</h2>
        </div>
      </div>

      <div className="flex flex-col gap-2 fade-in-up delay-1">
        <button
          onClick={() => navigate("/settings/categories")}
          className="glass-card p-4 flex items-center justify-between cursor-pointer text-left w-full"
          id="btn-manage-categories"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-(--r-md) bg-[rgba(217,119,87,0.12)] flex items-center justify-center">
              <Palette size={18} className="text-(--accent)" />
            </div>
            <div>
              <div className="font-sans text-[0.9375rem] font-medium text-(--text)">
                Manage Categories
              </div>
              <div className="font-sans text-xs text-(--text-muted) mt-0.5">
                Create, edit, or delete transaction categories
              </div>
            </div>
          </div>
          <ChevronRight size={18} className="text-(--text-muted)" />
        </button>
      </div>
    </>
  );
}
