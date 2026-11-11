/** Returns a uniformly shuffled copy (Fisher-Yates); the random source can be injected for tests. */
export function shuffle<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const other = Math.floor(random() * (index + 1));
    const current = shuffled[index] as T;
    shuffled[index] = shuffled[other] as T;
    shuffled[other] = current;
  }
  return shuffled;
}
