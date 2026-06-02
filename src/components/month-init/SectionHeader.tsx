import React from "react";

export function SectionHeader({
  icon,
  bgClassName,
  label,
}: {
  icon: React.ReactNode;
  bgClassName: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-3.5">
      <div
        className={`w-7.5 h-7.5 rounded-[9px] flex items-center justify-center ${bgClassName}`}
      >
        {icon}
      </div>
      <span className="font-sans text-sm font-semibold tracking-tight">
        {label}
      </span>
    </div>
  );
}
