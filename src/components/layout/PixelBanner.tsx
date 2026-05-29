/**
 * PixelBanner — A generative pixel-art mosaic header.
 *
 * Renders a symmetrically-mirrored pattern of geometric shapes
 * (crosses, L-shapes, diamonds, tetrominoes, etc.) unique to each user.
 *
 * Pass a `seed` string derived from user-specific data (e.g. name + createdAt)
 * to guarantee a distinct pattern for every user.
 */

// ─── Shape Templates ─────────────────────────────────────────────────────────
// Each template is an array of [dx, dy] offsets from an origin cell.

const SHAPE_TEMPLATES: ReadonlyArray<ReadonlyArray<readonly [number, number]>> = [
  // Cross / Plus
  [[0,0],[1,0],[-1,0],[0,1],[0,-1]],
  // L-shape
  [[0,0],[0,1],[0,2],[1,2]],
  // T-shape
  [[0,0],[1,0],[2,0],[1,1]],
  // Diamond
  [[1,0],[0,1],[2,1],[1,2]],
  // Z / Zigzag
  [[0,0],[1,0],[1,1],[2,1]],
  // S / Reverse zigzag
  [[1,0],[2,0],[0,1],[1,1]],
  // Domino horizontal
  [[0,0],[1,0]],
  // Domino vertical
  [[0,0],[0,1]],
  // Small square block (2×2)
  [[0,0],[1,0],[0,1],[1,1]],
  // Staircase
  [[0,0],[1,1],[2,2]],
  // Corner
  [[0,0],[1,0],[0,1]],
  // Arrow right
  [[0,1],[1,0],[1,1],[1,2],[2,1]],
  // Single dot
  [[0,0]],
  // Tetromino-I horizontal
  [[0,0],[1,0],[2,0],[3,0]],
  // Diagonal pair
  [[0,0],[1,1]],
  // Large plus
  [[1,0],[0,1],[1,1],[2,1],[1,2]],
  // Hook
  [[0,0],[0,1],[1,1],[2,1]],
  // U-shape
  [[0,0],[0,1],[1,1],[2,1],[2,0]],
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** DJB2-style string hash → positive integer */
function seedHash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = str.charCodeAt(i) + ((h << 5) - h);
  }
  return Math.abs(h);
}

/** Mulberry32 — simple, fast, deterministic 32-bit PRNG */
function mulberry32(seed: number) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

interface PixelBannerProps {
  /**
   * A string that uniquely identifies the current user.
   * Combine multiple signals for maximum uniqueness, e.g.
   *   `${profile.displayName}-${profile.createdAt.getTime()}`
   */
  seed: string;
}

export function PixelBanner({ seed }: PixelBannerProps) {
  const cellSize = 12;
  const viewW = 600;
  const viewH = 300; // Proportional to full card height
  const maxShapeRow = 7; // Rows 0–6 → top ~28% of card

  const rng = mulberry32(seedHash(seed));

  const halfW = viewW / 2;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const shapes: any[] = [];

  // Enough attempts for good density in the narrow top strip
  const shapeCount = 55 + Math.floor(rng() * 15);

  // Track occupied cells to prevent overlap
  const occupied = new Set<string>();
  const markOccupied = (cx: number, cy: number) => occupied.add(`${cx},${cy}`);
  const isOccupied = (cx: number, cy: number) => occupied.has(`${cx},${cy}`);

  const maxCol = Math.floor(halfW / cellSize);

  for (let i = 0; i < shapeCount; i++) {
    const templateIdx = Math.floor(rng() * SHAPE_TEMPLATES.length);
    const template = SHAPE_TEMPLATES[templateIdx];

    // Random origin — full width, top strip only
    const originCol = Math.floor(rng() * maxCol);
    const originRow = Math.floor(rng() * maxShapeRow);

    // Check bounds & overlap
    let fits = true;
    const cellPositions: [number, number][] = [];

    for (const [dx, dy] of template) {
      const cx = originCol + dx;
      const cy = originRow + dy;
      if (cx < 0 || cx >= maxCol || cy < 0 || cy >= maxShapeRow) {
        fits = false;
        break;
      }
      if (isOccupied(cx, cy)) {
        fits = false;
        break;
      }
      cellPositions.push([cx, cy]);
    }

    if (!fits) continue;

    // Mark cells as taken
    for (const [cx, cy] of cellPositions) {
      markOccupied(cx, cy);
    }

    // ── Opacity based on centroid position ──
    const centroidX =
      cellPositions.reduce((s, [cx]) => s + cx * cellSize, 0) / cellPositions.length;
    const centroidY =
      cellPositions.reduce((s, [, cy]) => s + cy * cellSize, 0) / cellPositions.length;

    // Horizontal: strongest near center, fading to outer edges
    const hDist = Math.abs(centroidX - halfW) / halfW;
    const hOpacity = Math.max(0.08, 1 - hDist * 0.9);

    // Vertical: full at top rows, fading at the bottom of the strip
    const stripMax = maxShapeRow * cellSize;
    const vRatio = centroidY / stripMax;
    let vOpacity = 1;
    if (vRatio < 0.1) vOpacity = 0.4 + (vRatio / 0.1) * 0.6;
    else if (vRatio > 0.7) vOpacity = Math.max(0.05, ((1 - vRatio) / 0.3) * 0.6);
    else vOpacity = 0.7;

    const opacity = hOpacity * vOpacity;
    if (opacity < 0.04) continue;

    // Render each cell on left side + mirrored right side
    for (const [cx, cy] of cellPositions) {
      const x = cx * cellSize;
      const y = cy * cellSize;

      shapes.push(
        <rect
          key={`l-${i}-${cx}-${cy}`}
          x={x}
          y={y}
          width={cellSize - 1}
          height={cellSize - 1}
          rx={1}
          opacity={opacity}
          className="profile-banner-pixel"
        />,
      );

      // Mirror
      const mirrorX = viewW - x - cellSize + 1;
      shapes.push(
        <rect
          key={`r-${i}-${cx}-${cy}`}
          x={mirrorX}
          y={y}
          width={cellSize - 1}
          height={cellSize - 1}
          rx={1}
          opacity={opacity}
          className="profile-banner-pixel"
        />,
      );
    }
  }

  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${viewW} ${viewH}`}
      preserveAspectRatio="xMidYMin slice"
      className="absolute inset-0 block select-none pointer-events-none z-0"
    >
      {shapes}
    </svg>
  );
}
