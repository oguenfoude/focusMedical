import "server-only";
import type { Dictionary } from "./types";

const dictionary = import("./dictionaries/fr.json").then((module) => module.default);

export const getDictionary = async (): Promise<Dictionary> => {
  return dictionary;
};
