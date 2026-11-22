import { votingPlayers } from "./selectors";
import type { WerewolfState } from "./stateMachine";

/** Research assumptions only: uniformly draw one to three nominees from a public, weighted pool. */
export function drawSimulationNominees(
  pool: readonly string[],
  random: () => number,
): readonly string[] {
  const count = Math.min(new Set(pool).size, 3);
  if (!count) return [];
  const needed = 1 + Math.floor(unit(random) * count);
  const nominees: string[] = [];
  let remaining = [...pool];
  while (nominees.length < needed) {
    const name = remaining[Math.floor(unit(random) * remaining.length)]!;
    nominees.push(name);
    remaining = remaining.filter((candidate) => candidate !== name);
  }
  return nominees;
}

/** Each legal voter draws a candidate; suspicion is public information, never the candidate's true role. */
export function drawSimulationBallots(
  state: WerewolfState,
  random: () => number,
  suspicion: ReadonlyMap<string, number> = new Map(),
): Readonly<Record<string, string>> {
  return Object.fromEntries(
    votingPlayers(state)
      .filter((voter) => voter.choices.length > 0)
      .map((voter) => {
        const weights = voter.choices.map((name) => 1 + Math.max(0, suspicion.get(name) ?? 0));
        if (weights.some((weight) => !Number.isFinite(weight)))
          throw new RangeError("Invalid suspicion");
        let point = unit(random) * weights.reduce((sum, weight) => sum + weight, 0);
        let selected = voter.choices[voter.choices.length - 1]!;
        for (let i = 0; i < weights.length; i++) {
          point -= weights[i]!;
          if (point < 0) {
            selected = voter.choices[i]!;
            break;
          }
        }
        return [voter.name, selected];
      }),
  );
}
function unit(random: () => number): number {
  const value = random();
  if (!Number.isFinite(value) || value < 0 || value >= 1)
    throw new RangeError("Invalid random value");
  return value;
}
