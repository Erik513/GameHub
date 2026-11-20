import { act, render, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { expect, it } from "vitest";
import type { GameSettingsMemory } from "../../business/shared/gameSettingsMemory";
import { GameSettingsMemoryProvider } from "./GameSettingsMemoryProvider";
import { usePersistentState } from "./usePersistentState";

function memoryWith(initial: Record<string, unknown> = {}) {
  const data = new Map(Object.entries(initial));
  const writes: [string, unknown][] = [];
  const memory: GameSettingsMemory = {
    read: (key) => data.get(key),
    write: (key, value) => {
      data.set(key, value);
      writes.push([key, value]);
    },
  };
  return { memory, writes };
}

const parseCount = (raw: unknown) => (typeof raw === "number" ? raw : undefined);

function hookWith(memory: GameSettingsMemory | undefined) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <GameSettingsMemoryProvider memory={memory}>{children}</GameSettingsMemoryProvider>
  );
  return renderHook(() => usePersistentState("game.count", () => 1, parseCount), { wrapper });
}

it("starts with what was saved and saves every change", () => {
  const { memory, writes } = memoryWith({ "game.count": 5 });
  const view = hookWith(memory);
  expect(view.result.current[0]).toBe(5);
  // Reading is not a change: nothing is written yet.
  expect(writes).toEqual([]);
  act(() => view.result.current[1](7));
  expect(view.result.current[0]).toBe(7);
  expect(writes).toEqual([["game.count", 7]]);
});

it("starts with the usual value when nothing or unusable data was saved", () => {
  expect(hookWith(memoryWith().memory).result.current[0]).toBe(1);
  expect(hookWith(memoryWith({ "game.count": "broken" }).memory).result.current[0]).toBe(1);
});

it("is plain state without a memory", () => {
  const view = hookWith(undefined);
  act(() => view.result.current[1](4));
  expect(view.result.current[0]).toBe(4);
});

it("keeps the settings of two games apart", () => {
  const { memory } = memoryWith({ "a.x": 2, "b.x": 3 });
  function Probe({ id }: { id: string }) {
    const [value] = usePersistentState(id + ".x", () => 0, parseCount);
    return <p>{value}</p>;
  }
  const first = render(
    <GameSettingsMemoryProvider memory={memory}>
      <Probe id="a" />
    </GameSettingsMemoryProvider>,
  );
  expect(first.container).toHaveTextContent("2");
  const second = render(
    <GameSettingsMemoryProvider memory={memory}>
      <Probe id="b" />
    </GameSettingsMemoryProvider>,
  );
  expect(second.container).toHaveTextContent("3");
});
