import { useMemo } from "react";

interface PixelArtBackgroundProps {
  pattern?: "core" | "portal" | "matrix" | "circuit" | "flow" | "signal";
  baseColor?: string;
  altColor?: string;
  opacity?: number;
}

export function PixelArtBackground({
  pattern = "core",
  baseColor = "#d97757", // Buckflo accent
  altColor = "#ffffff",
  opacity = 0.3,
}: PixelArtBackgroundProps) {
  const W_CELLS = 24; // Lower resolution for web performance
  const H_CELLS = 48;
  const CELL_SIZE = 20;
  const PADDING = 2;

  const rects = useMemo(() => {
    const generated: Array<{
      x: number;
      y: number;
      size: number;
      rx: number;
      fill: string;
      opacity: number;
      key: string;
    }> = [];

    // Simple seeded random to keep it consistent on re-renders
    let seed = 1;
    const random = () => {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };

    const getCell = (x: number, y: number) => {
      let a = 0;
      let color = baseColor;
      const cx = W_CELLS / 2;
      const cy = H_CELLS / 2;

      if (pattern === "core") {
        const dx = Math.abs(x - cx);
        const dy = Math.abs(y - cy);
        const dist = dx * 1.5 + dy * 0.7;

        if (dist < 15) {
          a = 1.0 - Math.pow(dist / 15.0, 2);
          if (Math.abs(x - cx) < 1.5) a *= 0.05;
          a += random() * 0.3 - 0.15;
          color = random() < 0.04 ? altColor : baseColor;
        } else if (random() < 0.01) {
          a = random() * 0.15 + 0.05;
        }
      } else if (pattern === "flow") {
        const wave = Math.sin(x * 0.25 + y * 0.15) * 8;
        const dist = Math.abs(x * 2.2 - y + wave + 5);

        if (dist < 12) {
          a = 1.0 - dist / 12.0;
          a += random() * 0.3 - 0.1;
          if (random() < 0.15) a *= 0.1;
          color = random() < 0.05 ? altColor : baseColor;
        } else if (random() < 0.005) {
          a = random() * 0.2 + 0.1;
          color = altColor;
        }
      } else if (pattern === "portal") {
        const dx = x - cx;
        const dy = y - cy;
        const dist = Math.sqrt(dx * dx * 1.5 + dy * dy * 0.8);
        const ring_val = Math.sin(dist * 0.6);

        if (dist < 20) {
          a = (ring_val + 1.0) / 2.0;
          a *= 1.0 - dist / 20.0;
          if (random() < 0.1) a *= random() * 0.4 + 0.1;
          color = dist < 4 && random() < 0.1 ? altColor : baseColor;
        }
      } else if (pattern === "signal") {
        const dx = Math.abs(x - cx);
        const col_strength = Math.max(0, 1.0 - dx / 6.0);
        if (col_strength > 0) {
          const dy = Math.abs(y - cy);
          const y_strength = Math.max(0, 1.0 - dy / (H_CELLS * 0.45));
          a = col_strength * y_strength;
          a *= [0.1, 0.7, 1.0, 1.0, 0.4][Math.floor(random() * 5)];
          if (y % 8 <= 1) a *= 0.05;
          color = dx < 2 && random() < 0.2 ? altColor : baseColor;
        }
      } else if (pattern === "matrix") {
        const localSeed = x * 12345;
        const start_y =
          Math.floor(Math.abs(Math.sin(localSeed)) * H_CELLS) - 10;
        const streak_len = Math.floor(Math.abs(Math.cos(localSeed)) * 20) + 10;

        if (y >= start_y && y < start_y + streak_len) {
          const progress = (y - start_y) / streak_len;
          a = Math.pow(progress, 1.5);
          if (random() < 0.15) a *= 0.2;
          const is_tip = y === start_y + streak_len - 1;
          color = is_tip ? altColor : baseColor;
          if ((x * 7) % 13 >= 4) a = 0; // Filter columns
        }
      }

      return { a, color };
    };

    for (let y = 0; y < H_CELLS; y++) {
      for (let x = 0; x < W_CELLS; x++) {
        const { a, color } = getCell(x, y);
        if (a > 0.03) {
          const clampedA = Math.min(1.0, Math.max(0.0, a));
          const cx = x * CELL_SIZE + PADDING;
          const cy = y * CELL_SIZE + PADDING;
          const size = CELL_SIZE - PADDING * 2;
          const rx = size * 0.15;
          generated.push({
            x: cx,
            y: cy,
            size,
            rx,
            fill: color,
            opacity: clampedA,
            key: `${x}-${y}`,
          });
        }
      }
    }
    return generated;
  }, [pattern, baseColor, altColor]);

  const width = W_CELLS * CELL_SIZE;
  const height = H_CELLS * CELL_SIZE;

  return (
    <div
      className="absolute inset-0 z-0 pointer-events-none overflow-hidden flex items-center justify-center"
      style={{ opacity }}
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full object-cover min-w-[100vw] min-h-[100vh] opacity-30"
        preserveAspectRatio="xMidYMid slice"
        style={{ filter: "blur(2px)" }}
      >
        {rects.map((rect) => (
          <rect
            key={rect.key}
            x={rect.x}
            y={rect.y}
            width={rect.size}
            height={rect.size}
            rx={rect.rx}
            fill={rect.fill}
            fillOpacity={rect.opacity}
          />
        ))}
      </svg>
      {/* Dark gradient overlay to ensure text readability */}
      <div className="absolute inset-0 bg-linear-to-t from-(--bg) via-(--bg)/80 to-transparent" />
      <div className="absolute inset-0 bg-radial from-transparent to-(--bg)/90" />
    </div>
  );
}
