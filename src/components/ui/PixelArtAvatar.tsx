

interface PixelArtAvatarProps {
  id: string;
  size: number;
  colors: string[];
  className?: string;
}

const GRIDS: Record<string, number[][]> = {
  silent_observer: [
    [0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 3, 3, 1, 0, 0, 0],
    [0, 0, 1, 3, 3, 3, 3, 1, 0, 0],
    [0, 1, 3, 3, 4, 4, 3, 3, 1, 0],
    [1, 3, 3, 4, 4, 4, 4, 3, 3, 1], // core center eye
    [1, 3, 3, 4, 4, 4, 4, 3, 3, 1],
    [0, 1, 3, 3, 4, 4, 3, 3, 1, 0],
    [0, 0, 1, 3, 3, 3, 3, 1, 0, 0],
    [0, 0, 0, 1, 3, 3, 1, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 0, 0, 0, 0]
  ],
  cafe_connoisseur: [
    [0, 0, 0, 0, 0, 0, 0, 3, 3, 3], // diagonal aroma wave gradient
    [0, 0, 0, 0, 0, 0, 3, 3, 3, 0],
    [0, 0, 0, 0, 0, 3, 3, 2, 0, 0],
    [0, 0, 0, 0, 3, 3, 2, 2, 0, 0],
    [0, 0, 0, 3, 3, 2, 2, 0, 0, 0],
    [0, 0, 3, 3, 2, 2, 1, 0, 0, 0],
    [0, 3, 3, 2, 2, 1, 1, 0, 0, 0],
    [3, 3, 2, 2, 1, 1, 0, 0, 0, 0],
    [3, 2, 2, 1, 1, 0, 0, 0, 0, 0],
    [2, 2, 1, 1, 0, 0, 0, 0, 0, 0]
  ],
  subscription_squirrel: [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // concentric committed boxes
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 2, 2, 2, 2, 2, 2, 0, 1],
    [1, 0, 2, 0, 0, 0, 0, 2, 0, 1],
    [1, 0, 2, 0, 3, 3, 0, 2, 0, 1],
    [1, 0, 2, 0, 3, 3, 0, 2, 0, 1],
    [1, 0, 2, 0, 0, 0, 0, 2, 0, 1],
    [1, 0, 2, 2, 2, 2, 2, 2, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
  ],
  weekend_warrior: [
    [0, 0, 0, 0, 0, 0, 0, 1, 1, 0], // energy surge/lightning bolt
    [0, 0, 0, 0, 0, 0, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 1, 1, 3, 0, 0],
    [0, 0, 0, 0, 1, 1, 3, 3, 0, 0],
    [0, 0, 0, 1, 1, 3, 3, 0, 0, 0],
    [0, 0, 1, 1, 3, 3, 2, 2, 0, 0],
    [0, 1, 1, 3, 3, 2, 2, 0, 0, 0],
    [1, 1, 3, 3, 2, 2, 0, 0, 0, 0],
    [0, 0, 2, 2, 0, 0, 0, 0, 0, 0],
    [0, 2, 2, 0, 0, 0, 0, 0, 0, 0]
  ],
  steady_streamer: [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 2, 2, 0, 0], // sine/ledger wave rhythm
    [0, 0, 0, 0, 2, 2, 1, 1, 2, 2],
    [0, 0, 2, 2, 1, 1, 3, 3, 1, 1],
    [2, 2, 1, 1, 3, 3, 0, 0, 3, 3],
    [1, 1, 3, 3, 0, 0, 0, 0, 0, 0],
    [3, 3, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // baseline
    [3, 3, 3, 3, 3, 3, 3, 3, 3, 3]
  ],
  balanced_sage: [
    [0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 0, 0, 0], // symmetrical balance emblem
    [0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
    [0, 1, 1, 0, 2, 2, 0, 1, 1, 0],
    [1, 1, 0, 2, 2, 2, 2, 0, 1, 1],
    [1, 1, 0, 2, 2, 2, 2, 0, 1, 1],
    [0, 1, 1, 0, 2, 2, 0, 1, 1, 0],
    [0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 0, 0, 0, 0]
  ]
};

export function PixelArtAvatar({
  id,
  size,
  colors,
  className = "",
}: PixelArtAvatarProps) {
  const grid = GRIDS[id] || GRIDS.balanced_sage;
  const cellSize = size / 10;
  const gap = cellSize * 0.12; // Sleek micro-gap
  const rectSize = cellSize - gap;
  const rx = rectSize * 0.25; // Smooth rounded corners for modern vector dot/pixel look

  // Resolve palette indexes to colors:
  // 0: transparent
  // 1: primary (colors[0])
  // 2: secondary (colors[1] or lighter primary)
  // 3: tertiary (colors[2] or darker primary)
  // 4: dark contrast (#1f1f1e)
  const resolveColor = (value: number) => {
    switch (value) {
      case 1:
        return colors[0] || "#d97757";
      case 2:
        return colors[1] || colors[0] || "#f59e0b";
      case 3:
        return colors[2] || colors[0] || "#78350f";
      case 4:
        return "#1f1f1e"; // eyes/accents
      default:
        return "transparent";
    }
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={`select-none shrink-0 ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Render modern pixel grid */}
      {grid.map((row, rIdx) =>
        row.map((cell, cIdx) => {
          if (cell === 0) return null;
          const color = resolveColor(cell);
          const x = cIdx * cellSize + gap / 2;
          const y = rIdx * cellSize + gap / 2;
          return (
            <rect
              key={`${rIdx}-${cIdx}`}
              x={x}
              y={y}
              width={rectSize}
              height={rectSize}
              rx={rx}
              ry={rx}
              fill={color}
            />
          );
        })
      )}
    </svg>
  );
}
