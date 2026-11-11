/** Returns a randomly ordered copy of the teams; the order is fixed for the whole game. */
export function shuffleTeams<T>(teams: readonly T[], random: () => number = Math.random): T[] {
  const shuffled = [...teams];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const other = Math.floor(random() * (index + 1));
    const current = shuffled[index] as T;
    shuffled[index] = shuffled[other] as T;
    shuffled[other] = current;
  }
  return shuffled;
}
