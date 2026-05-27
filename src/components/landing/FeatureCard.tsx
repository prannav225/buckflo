import { memo, type ReactNode } from "react";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  desc: string;
  borderClasses?: string;
}

export const FeatureCard = memo(function FeatureCard({
  icon,
  title,
  desc,
  borderClasses = "",
}: FeatureCardProps) {
  return (
    <div
      className={`p-8 flex flex-col items-start text-left hover:bg-neutral-500/2 dark:hover:bg-neutral-500/1 transition-colors duration-300 ${borderClasses}`}
    >
      <div className="w-8 h-8 rounded-lg bg-neutral-200/50 dark:bg-neutral-800/30 flex items-center justify-center mb-4 shrink-0">
        {icon}
      </div>
      <h4 className="text-base font-bold text-(--text) mb-2 tracking-tight">
        {title}
      </h4>
      <p className="text-[12px] text-(--text-secondary) leading-relaxed">
        {desc}
      </p>
    </div>
  );
});
