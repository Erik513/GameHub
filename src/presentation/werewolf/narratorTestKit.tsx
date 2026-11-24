import { useState } from "react";
import type { WerewolfSession } from "../../business/games/werewolf/session";
import { NarratorView } from "./NarratorView";

/** The narrator view with a game of its own for the tests: `start` makes the session the test begins with. */
export function NarratorHarness({ start }: { readonly start: () => WerewolfSession }) {
  const [session, setSession] = useState<WerewolfSession>(start);
  return (
    <NarratorView
      onEnd={() => undefined}
      onRules={() => undefined}
      onSession={setSession}
      session={session}
    />
  );
}
