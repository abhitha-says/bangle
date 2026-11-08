import type { Colour, ColourId } from "./types";

export const colours: Colour[] = [
  { id: "red", name: "Ruby Red", hindi: "Laal", swatch: "#a3142c", wash: "#f6e4e2" },
  { id: "pink", name: "Rani Pink", hindi: "Rani", swatch: "#b8185f", wash: "#f6e3ea" },
  { id: "blue", name: "Sapphire Blue", hindi: "Neela", swatch: "#1f2f6b", wash: "#e4e7f1" },
  { id: "green", name: "Emerald & Olive", hindi: "Hara", swatch: "#1f6b46", wash: "#e3eee4" },
  { id: "purple", name: "Amethyst & Amber", hindi: "Jamuni", swatch: "#5d2a7e", wash: "#ece3f0" },
  {
    id: "multi",
    name: "Many Hues",
    hindi: "Satrangi",
    swatch: "conic-gradient(from 200deg, #0f7a6a, #c9c22a, #e2902a, #e46a8a, #1f6b46, #0f7a6a)",
    wash: "#f3ece0",
  },
];

export const colourById = (id: ColourId) => colours.find((c) => c.id === id)!;
