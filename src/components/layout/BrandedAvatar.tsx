import Avatar from "boring-avatars";

const BRAND_PALETTE = [
  "#d97757",
  "#c2633e",
  "#788c5d",
  "#e8e6dc",
  "#141413",
];

interface BrandedAvatarProps {
  name: string;
  size: number;
  className?: string;
}

export function BrandedAvatar({
  name,
  size,
  className = "",
}: BrandedAvatarProps) {
  return (
    <div
      className={`rounded-full overflow-hidden border border-black/8 dark:border-white/6 flex items-center justify-center bg-white/5 dark:bg-white/3 select-none shrink-0 ${className}`}
    >
      <Avatar
        size={size}
        name={name}
        variant="beam"
        colors={BRAND_PALETTE}
        square={false}
      />
    </div>
  );
}
