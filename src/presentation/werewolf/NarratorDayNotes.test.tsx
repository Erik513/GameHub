import { render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { expect, it } from "vitest";
import { eventChoices } from "../../business/games/werewolf/eventChoices";
import {
  advanceWerewolfSession,
  createWerewolfSession,
  type WerewolfSession,
} from "../../business/games/werewolf/session";
import { createWerewolf } from "../../business/games/werewolf/stateMachine";
import { createGameHubI18n } from "../../i18n";
import { NarratorView } from "./NarratorView";

/** The notes of the day (who is silenced) stand in the upper box at the nomination, not in the lower box. */

const names = Array.from({ length: 12 }, (_, index) => "P" + index).join(",");

function toDayWithSilencedPerson(): WerewolfSession {
  let session = createWerewolfSession(
    createWerewolf(names, "Max", () => 0.3, [], { attackOnFirstNight: true, wolfCount: 2 })!,
  );
  for (let step = 0; step < 100 && session.present.status !== "day"; step++) {
    const events = eventChoices(session.present).filter(
      (event) => !(event.type === "attack" && event.target === null),
    );
    session = advanceWerewolfSession(session, events[0]!);
  }
  const silenced = session.present.alive[0]!.name;
  return { ...session, present: { ...session.present, silencedPlayer: silenced } };
}

/** The tanner who wins only by the vote is on the screen of the narrator from the beginning of the day. */
function toDayWithTanner(mode: "anyDeath" | "voteOnly"): WerewolfSession {
  let session = createWerewolfSession(
    createWerewolf(names, "Max", () => 0.3, ["tanner"], {
      attackOnFirstNight: true,
      tanner: mode,
      wolfCount: 2,
    })!,
  );
  for (let step = 0; step < 100 && session.present.status !== "day"; step++) {
    const events = eventChoices(session.present).filter(
      (event) => !(event.type === "attack" && event.target === null),
    );
    session = advanceWerewolfSession(session, events[0]!);
  }
  return session;
}

it.each(["en", "de"] as const)(
  "shows the tanner who wins only by the vote as a note in the upper box in %s, and not the other one",
  async (language) => {
    const i18n = await createGameHubI18n(language);
    for (const mode of ["voteOnly", "anyDeath"] as const) {
      const session = toDayWithTanner(mode);
      const { unmount } = render(
        <I18nextProvider i18n={i18n}>
          <NarratorView
            onEnd={() => undefined}
            onRules={() => undefined}
            onSession={() => undefined}
            session={session}
          />
        </I18nextProvider>,
      );
      const notes = [...document.querySelectorAll(".ww-role-card__notes .ww-guide__victim")].map(
        (note) => note.textContent,
      );
      const word = language === "en" ? "(tanner)" : "(Gerber)";
      expect(
        notes.some((note) => note?.includes(word)),
        mode,
      ).toBe(mode === "voteOnly");
      unmount();
    }
  },
);

it.each(["en", "de"] as const)(
  "shows the silenced person in the upper box at the day in %s",
  async (language) => {
    const i18n = await createGameHubI18n(language);
    const session = toDayWithSilencedPerson();
    render(
      <I18nextProvider i18n={i18n}>
        <NarratorView
          onEnd={() => undefined}
          onRules={() => undefined}
          onSession={() => undefined}
          session={session}
        />
      </I18nextProvider>,
    );
    const name = session.present.alive[0]!.name;
    const note = screen.getByText(new RegExp(name));
    // The note stands in the upper box (the card), once, and not in the lower box (the script).
    expect(note.closest(".ww-role-card")).not.toBeNull();
    expect(document.querySelectorAll(".ww-role-card__notes .ww-guide__victim")).toHaveLength(1);
    // The upper box always has a heading above the notes.
    expect(document.querySelector(".ww-role-card__top .ww-vote__heading")?.textContent).toBe(
      language === "en" ? "The day begins" : "Der Tag beginnt",
    );
    expect(document.querySelector(".ww-guide--sheet")?.textContent).not.toContain(name);
  },
);
