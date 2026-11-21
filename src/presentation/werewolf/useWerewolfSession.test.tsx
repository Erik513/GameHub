import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { emptyFixedDraft } from "../../business/games/werewolf/fixedConfiguration";
import {
  chooseNarrator,
  emptyWerewolfLineup,
  setParticipants,
} from "../../business/games/werewolf/lineup";
import { emptyVariableDraft } from "../../business/games/werewolf/variableConfiguration";
import { useWerewolfSession } from "./useWerewolfSession";

const names = "Anna Ben Cleo Dora Emil Finn Gina Hans Ida Jan Kim Lea Max".split(" ");
const lineup = chooseNarrator(setParticipants(emptyWerewolfLineup, names), "Max");
const input = {
  fixedDraft: emptyFixedDraft,
  lineup,
  mode: "fixed" as const,
  random: () => 0.3,
  variableDraft: emptyVariableDraft,
};

describe("useWerewolfSession", () => {
  it("starts without a game, then starts, advances, undoes and ends", () => {
    const { result } = renderHook(() => useWerewolfSession());
    expect(result.current.session).toBeNull();
    expect(result.current.undo()).toBe("emptyHistory");
    let started = false;
    act(() => {
      started = result.current.start(input);
    });
    expect(started).toBe(true);
    const first = result.current.session!.present;
    expect(first.status).toBe("roles");
    const player = first.players[0]!.name;
    act(() => result.current.advance({ player, type: "roleSeen" }));
    expect(result.current.session!.past).toHaveLength(1);
    let reason: string | null = "x";
    act(() => {
      reason = result.current.undo();
    });
    expect(reason).toBeNull();
    expect(result.current.session!.past).toHaveLength(0);
    act(() => result.current.end());
    expect(result.current.session).toBeNull();
  });

  it("refuses to start an unplayable game", () => {
    const { result } = renderHook(() => useWerewolfSession());
    let started = true;
    act(() => {
      started = result.current.start({ ...input, random: () => 2 });
    });
    expect(started).toBe(false);
    expect(result.current.session).toBeNull();
  });
});
