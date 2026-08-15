import type { Color } from "@lostcities/shared";

export const COLOR_META: Record<
  Color,
  { label: string; image: string; wagerImage: string; labelImage: string; accent: string; labelFg: string }
> = {
  petra: {
    label: "Petra",
    image: "/cards/petra.jpg",
    wagerImage: "/cards/wagers/petra.jpg",
    labelImage: "/cards/labels/petra.jpg",
    accent: "#b98a3f",
    labelFg: "#ffffff",
  },
  jungle: {
    label: "Chichén Itzá",
    image: "/cards/jungle.jpg",
    wagerImage: "/cards/wagers/jungle.jpg",
    labelImage: "/cards/labels/jungle.jpg",
    accent: "#3f7a4a",
    labelFg: "#ffffff",
  },
  dome: {
    label: "Atlantis",
    image: "/cards/dome.jpg",
    wagerImage: "/cards/wagers/dome.jpg",
    labelImage: "/cards/labels/dome.jpg",
    accent: "#3a6f96",
    labelFg: "#ffffff",
  },
  mountain: {
    label: "Shangri‑La", // non-breaking hyphen so it never wraps mid-word
    image: "/cards/mountain.jpg",
    wagerImage: "/cards/wagers/mountain.jpg",
    labelImage: "/cards/labels/mountain.jpg",
    accent: "#7fa8c9",
    labelFg: "#1a2530",
  },
  angkor: {
    label: "Angkor Wat",
    image: "/cards/angkor.jpg",
    wagerImage: "/cards/wagers/angkor.jpg",
    labelImage: "/cards/labels/angkor.jpg",
    accent: "#5b5b58",
    labelFg: "#ffffff",
  },
};
