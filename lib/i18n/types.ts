import type fr from "./dictionaries/fr.json";

type DeepStringRecord<T> = {
  [K in keyof T]: T[K] extends object ? DeepStringRecord<T[K]> : string;
};

export type Dictionary = DeepStringRecord<typeof fr>;
