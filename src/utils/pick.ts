/** A random item of a list that must not be empty (a typo or a missing import would make it so). */
export function pickRandom<T>(items: readonly T[]): T {
  const item: T | undefined = items[Math.floor(Math.random() * items.length)];
  if (item === undefined) throw new Error('pickRandom needs at least one item');
  return item;
}

/** The item after `current` in a list, wrapping around (the first one if `current` is not in it). */
export function nextInCycle<T>(items: readonly T[], current: T): T {
  const item: T | undefined = items[(items.indexOf(current) + 1) % items.length];
  if (item === undefined) throw new Error('nextInCycle needs at least one item');
  return item;
}
