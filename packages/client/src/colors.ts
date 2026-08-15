import type { Color } from "@lostcities/shared";

export const COLOR_META: Record<Color, { label: string; image: string; accent: string; labelFg: string }> = {
  petra: { label: "Petra", image: "/cards/petra.jpg", accent: "#b98a3f", labelFg: "#ffffff" },
  jungle: { label: "Djungeltemplet", image: "/cards/jungle.jpg", accent: "#3f7a4a", labelFg: "#ffffff" },
  dome: { label: "Kupolen", image: "/cards/dome.jpg", accent: "#3a6f96", labelFg: "#ffffff" },
  mountain: { label: "Bergsklostret", image: "/cards/mountain.jpg", accent: "#7fa8c9", labelFg: "#1a2530" },
  angkor: { label: "Angkor Wat", image: "/cards/angkor.jpg", accent: "#5b5b58", labelFg: "#ffffff" },
};
