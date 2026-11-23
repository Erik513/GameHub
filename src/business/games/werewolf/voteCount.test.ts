import { expect, it } from "vitest";
import { eventChoices } from "./eventChoices";
import {
  backGuide,
  chooseAbility,
  choosePlayer,
  continueGuide,
  createGuide,
  describeGuide,
  setVoteBonus,
  setVoteCount,
} from "./narratorGuide";
import { advanceWerewolfSession, createWerewolfSession } from "./session";
import {
  createWerewolf,
  transitionWerewolf,
  voteNeeded,
  voteTieAt,
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

it("votes yes or no about one nominated person: more than half of the votes cast make him leave the game", () => {
  const state = toVote(1);
  const [only] = state.candidates as [string];
  const voters = state.alive.length; // all alive vote, but the nominated person does not vote for his own execution
  const cast = voters - 1;
  const needed = Math.floor(cast / 2) + 1;
  expect(voteNeeded(state)).toBe(needed);
  expect(voteTotal(state)).toBe(cast);
  // Enough yes votes: he leaves. One yes vote less: he stays and the day goes on. Zero yes votes is a valid result, too.
  expect(transitionWerewolf(state, countsEvent(state, { [only]: needed }))).toMatchObject({
    status: "exile",
    victim: { name: only },
  });
  // One yes vote less: a tie when the yes votes are half of the votes cast, otherwise he stays.
  expect(transitionWerewolf(state, countsEvent(state, { [only]: needed - 1 })).status).toBe(
    voteTieAt(state) === needed - 1 ? "vote" : "day",
  );
  expect(transitionWerewolf(state, countsEvent(state, { [only]: 0 })).status).toBe("day");
  // He does not vote for his own execution: more yes votes than the others have are refused.
  expect(transitionWerewolf(state, countsEvent(state, { [only]: voters }))).toBe(state);
});

it("counts the mayor with the double vote twice in the vote about one person", () => {
  const plain = toVote(1, ["mayor"], { mayor: "hammer" });
  const doubled = toVote(1, ["mayor"], { mayor: "doubleVote" });
  // One more vote: the threshold (more than half of all votes) may rise with it.
  expect(voteNeeded(doubled)).toBe(Math.floor(voteTotal(doubled) / 2) + 1);
  expect(voteTotal(doubled)).toBe(voteTotal(plain) + 1);
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
  expect(continueGuide(guide).session.present.status).toBe(
    view.voteTieAt === view.voteNeeded - 1 ? "vote" : "day",
  );
  // Enough: he leaves.
  guide = setVoteCount(guide, nominee, view.voteNeeded);
  expect(describeGuide(continueGuide(guide))).toMatchObject({ exiledToday: [expect.any(String)] });
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
  expect(describeGuide(continueGuide(guide))).toMatchObject({ exiledToday: [expect.any(String)] });
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

it("breaks the vote off with back: to the nomination, however often it was done before", () => {
  // A game that was played through (the history is there), up to the vote about two nominated people.
  let session = createWerewolfSession(
    createWerewolf(names.join(","), "Max", () => 0.3, [], {
      attackOnFirstNight: true,
      wolfCount: 2,
    })!,
  );
  for (let guard = 0; guard < 100 && session.present.status !== "day"; guard += 1) {
    const events = eventChoices(session.present).filter(
      (event) => !(event.type === "attack" && event.target === null),
    );
    session = advanceWerewolfSession(session, events[0]!);
  }
  const chosen = session.present.alive.slice(0, 2).map((player) => player.name);
  session = advanceWerewolfSession(session, {
    night: session.present.night,
    nominees: chosen,
    type: "nominate",
  });
  let guide = createGuide(createWerewolfSession(session.present));
  guide = { ...guide, session };
  for (let round = 0; round < 3; round += 1) {
    expect(describeGuide(guide).state.status).toBe("vote");
    expect(describeGuide(guide).canGoBack).toBe(true);
    const back = backGuide(guide, true);
    expect(back.ok).toBe(true);
    if (!back.ok) return;
    guide = back.guide;
    expect(describeGuide(guide).state.status).toBe("day");
    // The nomination is made once more.
    guide = chooseAbility(guide, "vote");
    for (const name of chosen) guide = choosePlayer(guide, name);
    guide = continueGuide(guide);
  }
  expect(describeGuide(guide).state.status).toBe("vote");
});

it("assigns the second vote of the mayor with the double vote: the vote can only be confirmed when it is assigned", () => {
  const state = toVote(2, ["mayor"], { mayor: "doubleVote" });
  let guide = createGuide(createWerewolfSession(state));
  const view = describeGuide(guide);
  // The mayor has two votes: one vote more to enter, and he is offered the second vote to give.
  expect(view.voteBonus).toMatchObject({ chosen: null, required: true });
  const mayor = view.voteBonus!.mayor;
  const [one, two] = state.candidates as [string, string];
  // The mayor does not vote for himself: if he is nominated, he cannot give the second vote to himself.
  expect(view.voteBonus!.choices).not.toContain(mayor);
  const total = view.voteTotal;
  const bonusFor = view.voteBonus!.choices[0]!;
  const other = bonusFor === one ? two : one;
  // All votes but the second vote of the mayor are entered: the sum is one short until he assigns it.
  guide = setVoteCount(guide, bonusFor, total - 1 - 3);
  guide = setVoteCount(guide, other, 3);
  expect(describeGuide(guide)).toMatchObject({ canContinue: false, voteSum: total - 1 });
  // The second vote is assigned: it counts for the person (shown in the sum), and the vote can be confirmed.
  guide = setVoteBonus(guide, bonusFor);
  expect(describeGuide(guide)).toMatchObject({ canContinue: true, voteSum: total });
  expect(describeGuide(guide).voteBonus?.chosen).toBe(bonusFor);
  // Tapping the same person again takes it back; a person who is not nominated cannot get it.
  expect(describeGuide(setVoteBonus(guide, bonusFor)).voteBonus?.chosen).toBeNull();
  expect(setVoteBonus(guide, "Nobody")).toBe(guide);
  expect(describeGuide(continueGuide(guide))).toMatchObject({ exiledToday: [expect.any(String)] });
});

it("keeps one vote free for the second vote of the mayor: the numbers add up to all votes minus one at most", () => {
  const state = toVote(3, ["mayor"], { mayor: "doubleVote" });
  let guide = createGuide(createWerewolfSession(state));
  const total = describeGuide(guide).voteTotal;
  const [first, second, third] = state.candidates as [string, string, string];
  // All votes but one can be entered; the last one is the second vote.
  guide = setVoteCount(guide, first, total - 3);
  guide = setVoteCount(guide, second, 2);
  expect(describeGuide(guide).voteSum).toBe(total - 1);
  expect(setVoteCount(guide, third, 1)).toBe(guide);
  // The vote cannot be confirmed before the second vote is assigned.
  expect(describeGuide(guide).canContinue).toBe(false);
  const choice = describeGuide(guide).voteBonus!.choices[0]!;
  guide = setVoteBonus(guide, choice);
  expect(describeGuide(guide)).toMatchObject({ canContinue: true, voteSum: total });
  // With the second vote assigned, no further vote can be added.
  expect(setVoteCount(guide, third, 1)).toBe(guide);
});

it("holds the vote about one person once more when the yes votes are as many as the no votes", () => {
  // 11 people are alive: 10 votes can be cast (without the nominee), an even number.
  const state = toVote(1);
  let guide = createGuide(createWerewolfSession(state));
  const view = describeGuide(guide);
  const nominee = state.candidates[0]!;
  // Even number of votes: half of them yes is a tie (more than half is needed).
  expect(view.voteTieAt).not.toBeNull();
  guide = setVoteCount(guide, nominee, view.voteTieAt!);
  const again = describeGuide(continueGuide(guide));
  expect(again.state).toMatchObject({ status: "vote", round: 2 });
  expect(again.voteCounts[nominee]).toBe(0);
  // The tie stays in the history for the replay of the game: the counts of the first round are logged.
  expect(again.state.history.at(-1)).toMatchObject({
    kind: "action",
    event: { type: "voteCount", counts: { [nominee]: view.voteTieAt } },
    phase: "vote",
  });
  // A second tie leaves him in the game: the day goes on.
  guide = setVoteCount(continueGuide(guide), nominee, view.voteTieAt!);
  expect(continueGuide(guide).session.present.status).toBe("day");
});

it("limits every nominated person to all votes minus his own, the second vote of the mayor included", () => {
  const state = toVote(3);
  let guide = createGuide(createWerewolfSession(state));
  const view = describeGuide(guide);
  const [first] = state.candidates as [string, string, string];
  const max = view.voteMax[first]!;
  // A nominated person who votes does not vote for himself.
  expect(max).toBe(view.voteTotal - 1);
  guide = setVoteCount(guide, first, max);
  expect(describeGuide(guide).voteCounts[first]).toBe(max);
  expect(setVoteCount(guide, first, max + 1)).toBe(guide);
});

it("gives the second vote of the mayor in the vote about one person as an additional yes vote", () => {
  const state = toVote(1, ["mayor"], { mayor: "doubleVote" });
  let guide = createGuide(createWerewolfSession(state));
  const view = describeGuide(guide);
  const nominee = state.candidates[0]!;
  const mayor = view.voteBonus?.mayor;
  if (mayor === undefined || mayor === nominee) return;
  expect(view.voteBonus).toMatchObject({ chosen: null, required: false });
  const needed = view.voteNeeded;
  // One yes vote short of the majority; the second vote of the mayor makes the difference.
  guide = setVoteCount(guide, nominee, needed - 1);
  guide = setVoteBonus(guide, nominee);
  expect(describeGuide(guide).voteSum).toBe(needed);
  expect(describeGuide(continueGuide(guide))).toMatchObject({ exiledToday: [expect.any(String)] });
});
