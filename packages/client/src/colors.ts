import type { Color } from "@lostcities/shared";

export const COLOR_META: Record<
  Color,
  { label: string; image: string; labelImage: string; accent: string; labelFg: string }
> = {
  petra: { label: "Petra", image: "/cards/petra.jpg", labelImage: "/cards/labels/petra.jpg", accent: "#b98a3f", labelFg: "#ffffff" },
  jungle: {
    label: "Chichén Itzá",
    image: "/cards/jungle.jpg",
    labelImage: "/cards/labels/jungle.jpg",
    accent: "#3f7a4a",
    labelFg: "#ffffff",
  },
  dome: { label: "Atlantis", image: "/cards/dome.jpg", labelImage: "/cards/labels/dome.jpg", accent: "#3a6f96", labelFg: "#ffffff" },
  mountain: {
    label: "Shangri-La",
    image: "/cards/mountain.jpg",
    labelImage: "/cards/labels/mountain.jpg",
    accent: "#7fa8c9",
    labelFg: "#1a2530",
  },
  angkor: {
    label: "Angkor Wat",
    image: "/cards/angkor.jpg",
    labelImage: "/cards/labels/angkor.jpg",
    accent: "#5b5b58",
    labelFg: "#ffffff",
  },
};
