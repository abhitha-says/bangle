import { IMG } from "./images";
import type { Collection } from "./types";

export const collections: Collection[] = [
  {
    id: "ekrang",
    name: "Ekrang",
    meaning: "One colour",
    description:
      "A single jewel tone, repeated stone after stone. Ekrang stacks are a study in depth: ruby, rani, sapphire, emerald and olive, each one quietly certain of itself.",
    cover: IMG.rubyStyled,
  },
  {
    id: "jugalbandi",
    name: "Jugalbandi",
    meaning: "A duet",
    description:
      "Named for the musical conversation between two artists. Two colours trade lines down the wrist, amethyst answering amber, so the stack never reads the same twice.",
    cover: IMG.amethystStyled,
  },
  {
    id: "satrang",
    name: "Satrang",
    meaning: "Seven colours",
    description:
      "Stones that shift from teal to lime to rose within a single bangle. Satrang is colour without hesitation, made for haldi mornings and mehendi nights.",
    cover: IMG.gradientStudio,
  },
];

export const collectionById = (id: string) => collections.find((c) => c.id === id);
