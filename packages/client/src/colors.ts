import type { Color } from "@lostcities/shared";

export const COLOR_META: Record<Color, { label: string; bg: string; fg: string; accent: string }> = {
  red: { label: "Röd", bg: "#c62f2f", fg: "#ffffff", accent: "#8f1f1f" },
  green: { label: "Grön", bg: "#2f8f4f", fg: "#ffffff", accent: "#1f6236" },
  white: { label: "Vit", bg: "#f4f1ea", fg: "#20242a", accent: "#c9c2b2" },
  blue: { label: "Blå", bg: "#2f6fb0", fg: "#ffffff", accent: "#1f4d80" },
  yellow: { label: "Gul", bg: "#e0b400", fg: "#20242a", accent: "#a8830a" },
};
