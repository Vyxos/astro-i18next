/**
 * Applies `Pick<T, K>` to each member of a union type `T`.
 * @template T The union type.
 * @template K The keys to pick.
 */
export type DPick<T, K extends keyof T> = T extends unknown
  ? Pick<T, K>
  : never;

export type OptionalKeys<T> = {
  [K in keyof T]-?: undefined extends T[K] ? K : never;
}[keyof T];
