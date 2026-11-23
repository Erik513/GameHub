import { expect, it } from "vitest";
import { eventChoices } from "./eventChoices";
import { continueGuide, createGuide, describeGuide, setVoteCount } from "./narratorGuide";
import { createWerewolfSession } from "./session";
import {
  createWerewolf,
  transitionWerewolf,
  voteNeeded,
  voteTotal,
  type WerewolfSettings,
  type WerewolfSpecialRole,
  type WerewolfState,
} from "./stateMachine";

/** The vote counted per candidate: the narrator enters the votes of every nominated person. */

const names = Array.from({ length: 12 }, (_, index) => "P" + index);

type VoteState = Extract<WerewolfState, { status: "vote" }>;

function toVote(
  nominees: number,
  roles: readonly WerewolfSpecialRole[] = [],
  settings: Partial<WerewolfSettings> = {},
): VoteState {
  let state = createWerewolf(names.join(","), "Max", () => 0.3, roles, {
    attackOnFirstNight: true,
    wolfCount: 2,
    ...settings,
  })!;
  for (let guard = 0; guard < 100 && state.status !== "day"; guard += 1) {
    const events = eventChoices(state).filter(
      (event) => !(event.type === "attack" && event.target === null),
    );
    state = transitionWerewolf(state, events[0]!);
  }
  expect(state.status).toBe("day");
  const chosen = state.alive.slice(0, nominees).map((player) => player.name);
  const vote = transitionWerewolf(state, {
    night: state.night,
    nominees: chosen,
    type: "nominate",
  });
  if (vote.status !== "vote") throw new Error("no vote");
  return vote;
}

const countsEvent = (state: VoteState, counts: Record<string, number>) =>
  ({ counts, night: state.night, nomination: state.nomination, type: "voteCount" }) as const;

it("counts a vote entered per candidate: all votes have to be added up", () => {
  const state = toVote(2);
  const [one, two] = state.candidates as [string, string];
  const total = voteTotal(state);
  // Both nominated people vote, too (each one for the other): everybody alive has one vote.
  expect(total).toBe(state.alive.length);
  const valid = countsEvent(state, { [one]: total - 3, [two]: 3 });
  expect(transitionWerewolf(state, valid)).toMatchObject({
    status: "exile",
    victim: { name: one },
  });
  // Too few or too many votes, a missing candidate and numbers that are no whole numbers are refused.
  expect(transitionWerewolf(state, countsEvent(state, { [one]: total - 4, [two]: 3 }))).toBe(state);
  expect(transitionWerewolf(state, countsEvent(state, { [one]: total - 3, [two]: 4 }))).toBe(state);
  expect(transitionWerewolf(state, countsEvent(state, { [one]: total }))).toBe(state);
  expect(transitionWerewolf(state, countsEvent(state, { [one]: 5.5, [two]: total - 5.5 }))).toBe(
    state,
  );
  expect(transitionWerewolf(state, countsEvent(state, { [one]: -1, [two]: total + 1 }))).toBe(
    state,
  );
  // Nobody votes for himself: a nominated person who votes cannot have all the votes.
  expect(transitionWerewolf(state, countsEvent(state, { [one]: total, [two]: 0 }))).toBe(state);
});

it("lets a tie go on to a second vote among the tied people", () => {
  const state = toVote(3);
  const [one, two, three] = state.candidates as [string, string, string];
  const total = voteTotal(state);
  // The first two are tied, the third has fewer.
  const tied = Math.floor(total / 2) - 1;
  const next = transitionWerewolf(
    state,
    countsEvent(state, { [one]: tied, [two]: tied, [three]: total - 2 * tied }),
  );
  expect(next).toMatchObject({ candidates: [one, two], round: 2, status: "vote" });
});

it("counts the mayor with the double vote twice: the votes to enter are one more", () => {
  const without = toVote(2, ["mayor"], { mayor: "hammer" });
  const doubled = toVote(2, ["mayor"], { mayor: "doubleVote" });
  expect(voteTotal(doubled)).toBe(voteTotal(without) + 1);
});

it("votes yes or no about one nominated person: more than half of all votes make him leave the game", () => {
  const state = toVote(1);
  const [only] = state.candidates as [string];
  const voters = state.alive.length; // all alive vote, the nominated person too (he does not vote for his own execution)
  const needed = Math.floor(voters / 2) + 1;
  expect(voteNeeded(state)).toBe(needed);
  expect(voteTotal(state)).toBe(voters - 1);
  // Enough yes votes: he leaves. One yes vote less: he stays and the day goes on. Zero yes votes is a valid result, too.
  expect(transitionWerewolf(state, countsEvent(state, { [only]: needed }))).toMatchObject({
    status: "exile",
    victim: { name: only },
  });
  expect(transitionWerewolf(state, countsEvent(state, { [only]: needed - 1 })).status).toBe("day");
  expect(transitionWerewolf(state, countsEvent(state, { [only]: 0 })).status).toBe("day");
  // He does not vote for his own execution: more yes votes than the others have are refused.
  expect(transitionWerewolf(state, countsEvent(state, { [only]: voters }))).toBe(state);
});

it("counts the mayor with the double vote twice in the vote about one person", () => {
  const plain = toVote(1, ["mayor"], { mayor: "hammer" });
  const doubled = toVote(1, ["mayor"], { mayor: "doubleVote" });
  // One more vote: the threshold (more than half of all votes) may rise with it.
  expect(voteNeeded(doubled)).toBe(Math.floor((plain.alive.length + 1) / 2) + 1);
});

it("enters the yes votes through the guide: the vote can be confirmed at any number, the person leaves with enough", () => {
  let guide = createGuide(createWerewolfSession(toVote(1)));
  const view = describeGuide(guide);
  expect(view.state.status).toBe("vote");
  expect(view.voteNeeded).toBeGreaterThan(3);
  const nominee = (view.state as VoteState).candidates[0]!;
  // Only whole numbers up to the yes votes there can be are taken.
  expect(setVoteCount(guide, nominee, -1)).toBe(guide);
  expect(setVoteCount(guide, nominee, 1.5)).toBe(guide);
  expect(setVoteCount(guide, nominee, view.voteTotal + 1)).toBe(guide);
  expect(setVoteCount(guide, "Nobody", 1)).toBe(guide);
  // Too few yes votes: the vote can be confirmed, the person stays and the day goes on.
  guide = setVoteCount(guide, nominee, view.voteNeeded - 1);
  expect(describeGuide(guide).canContinue).toBe(true);
  expect(continueGuide(guide).session.present.status).toBe("day");
  // Enough: he leaves.
  guide = setVoteCount(guide, nominee, view.voteNeeded);
  expect(continueGuide(guide).session.present.status).toBe("exile");
});

it("enters the votes of several nominated people through the guide: all votes have to be added up", () => {
  let guide = createGuide(createWerewolfSession(toVote(2)));
  const view = describeGuide(guide);
  const [one, two] = (view.state as VoteState).candidates as [string, string];
  expect(view.voteNeeded).toBe(0);
  expect(view.canContinue).toBe(false);
  guide = setVoteCount(guide, one, view.voteTotal - 3);
  guide = setVoteCount(guide, two, 2);
  expect(describeGuide(guide).canContinue).toBe(false);
  guide = setVoteCount(guide, two, 3);
  expect(describeGuide(guide)).toMatchObject({ canContinue: true, voteSum: view.voteTotal });
  expect(continueGuide(guide).session.present.status).toBe("exile");
});

it("does not attribute a counted runoff to the voters of an earlier named ballot", () => {
  const base = toVote(2);
  const [one, two] = base.candidates as [string, string];
  const muted = base.alive.find((p) => p.name !== one && p.name !== two)!.name;
  const state = { ...base, silencedPlayer: muted };
  let at = 0;
  const ballots = Object.fromEntries(
    state.alive
      .filter((p) => p.name !== muted)
      .map(({ name }) => [name, name === one ? two : name === two ? one : at++ < 4 ? one : two]),
  );
  const runoff = transitionWerewolf(state, {
    type: "vote",
    night: state.night,
    nomination: state.nomination,
    ballots,
  });
  expect(runoff).toMatchObject({ status: "vote", round: 2 });
  if (runoff.status !== "vote") throw Error("Missing runoff");
  const exile = transitionWerewolf(runoff, countsEvent(runoff, { [one]: 6, [two]: 4 }));
  expect(exile.status).toBe("exile");
  const ended = transitionWerewolf(exile, { type: "announceExile", night: exile.night });
  const death = ended.history.find((entry) => entry.kind === "death" && entry.player === one);
  expect(death).toMatchObject({ kind: "death", sources: [{ cause: "vote", actors: [] }] });
});
