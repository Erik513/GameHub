/**
 * The order in which people who leave the game at once are named: by the time of their death.
 *
 * The causes in the order of the night: the delayed death of the tough guy comes first (before anybody can attack),
 * then the wolves, the witch, the magician and the hammer of the mayor. The first death counts: whoever dies of heartbreak
 * stands right after the lover who died first, and a later attack on the partner (a second attack) does not change that.
 */
export const deathTimeOfCause = {
  hammer: 3,
  hammerBackfire: 3,
  heartbreak: 5,
  hunter: 0,
  magicianKill: 2,
  toughGuy: -1,
  vote: 0,
  witchPoison: 1,
  wolves: 0,
} as const;

export type DeathTimeCause = keyof typeof deathTimeOfCause;

/**
 * Sorts `names` by time of death. `own` holds the earliest time of an attack for each person (the people who only die
 * of heartbreak are not in it); `lovers` are the two partners, if there are any. People of equal time keep their order.
 */
export function inOrderOfDeath(
  names: readonly string[],
  own: ReadonlyMap<string, number>,
  lovers: readonly string[] | null | undefined,
): string[] {
  const timeOf = (name: string): number => {
    const mine = own.get(name) ?? Number.POSITIVE_INFINITY;
    const partner = lovers?.includes(name) ? lovers.find((other) => other !== name) : undefined;
    const theirs =
      partner !== undefined && names.includes(partner)
        ? (own.get(partner) ?? Number.POSITIVE_INFINITY)
        : Number.POSITIVE_INFINITY;
    // The partner who died first stays first; the other one dies of heartbreak right after, unless an attack came earlier.
    const time = theirs < mine ? Math.min(mine, theirs + 0.5) : mine;
    return Number.isFinite(time) ? time : 5;
  };
  return names
    .map((name, index) => ({ index, name, time: timeOf(name) }))
    .sort((one, other) => one.time - other.time || one.index - other.index)
    .map((entry) => entry.name);
}
