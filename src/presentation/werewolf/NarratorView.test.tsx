import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { I18nextProvider } from "react-i18next";
import { describe, expect, it, vi } from "vitest";
import { createWerewolfSession, type WerewolfSession } from "../../business/games/werewolf/session";
import { createWerewolf } from "../../business/games/werewolf/stateMachine";
import { createGameHubI18n } from "../../i18n";
import { NarratorView } from "./NarratorView";

const names = "Anna,Ben,Cleo,Dora,Emil,Finn,Gina,Hans,Ida,Jan,Kim,Lea";

function Harness({ onEnd }: { readonly onEnd: () => void }) {
  const [session, setSession] = useState<WerewolfSession>(() =>
    createWerewolfSession(createWerewolf(names, "Max", () => 0.3, [], {})!),
  );
  return (
    <NarratorView
      onEnd={onEnd}
      onRules={() => undefined}
      onSession={setSession}
      session={session}
    />
  );
}

/** After the role reveal the button below says "begin"; one tap starts the game. */
async function beginGame(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: /^(Begin|Beginnen)$/ }));
}

async function renderView(language: "en" | "de", onEnd = () => undefined) {
  const i18n = await createGameHubI18n(language);
  const user = userEvent.setup();
  render(
    <I18nextProvider i18n={i18n}>
      <Harness onEnd={onEnd} />
    </I18nextProvider>,
  );
  return user;
}

describe.each([
  {
    back: "Back",
    next: "Next",
    language: "en",
    reveal: "Hand the device to this person.",
    wake: /werewolves wake up/,
  },
  {
    back: "Zurück",
    next: "Weiter",
    language: "de",
    reveal: "Gib das Gerät an diese Person weiter.",
    wake: /Werwölfe erwachen/,
  },
] as const)("NarratorView in $language", ({ back, language, next, reveal, wake }) => {
  it("leads from the role reveal to the first role and back", async () => {
    const user = await renderView(language);
    expect(screen.getByText(reveal)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: back })).toBeDisabled();
    for (let player = 0; player < 12; player += 1)
      await user.click(screen.getByRole("button", { name: next }));
    // The last player has looked: nothing of the game shows, the narrator begins it on purpose.
    expect(screen.getByText(/All roles are dealt|Alle Rollen sind verteilt/)).toBeInTheDocument();
    expect(screen.queryByText(wake)).toBeNull();
    expect(
      screen.queryByRole("button", { name: /All players and roles|Alle Spieler und Rollen/ }),
    ).toBeNull();
    expect(screen.queryByRole("button", { name: next })).toBeNull();
    await beginGame(user);
    expect(screen.getByRole("button", { name: next })).toBeInTheDocument();
    // The role is announced; the upper box stays hidden until the narrator taps.
    expect(screen.getByText(wake)).toBeInTheDocument();
    expect(screen.queryByRole("region", { name: /Werewolf|Werwolf/ })).toBeNull();
    await user.click(document.querySelector(".ww-script__wake")!);
    expect(screen.getByRole("region", { name: /Werewolf|Werwolf/ })).toBeInTheDocument();
    // Back leaves the whole step of the role: from the first role to the waiting box, then to the last player.
    await user.click(screen.getByRole("button", { name: back }));
    expect(screen.getByText(/All roles are dealt|Alle Rollen sind verteilt/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: back }));
    expect(screen.getByText(reveal)).toBeInTheDocument();
  });

  it("shows the role on a tap, covers it on the next tap and explains it", async () => {
    const user = await renderView(language);
    // The covered card says which player this is.
    expect(screen.getByText(/Player: 1\/12|Spieler: 1\/12/)).toBeInTheDocument();
    const face = screen.getAllByRole("button", { pressed: false })[0]!;
    expect(screen.queryByRole("button", { name: /Info|info/ })).toBeNull();
    await user.click(face);
    expect(screen.getByRole("button", { pressed: true })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Info|info/ })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { pressed: true }));
    expect(screen.getByText(reveal)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Info|info/ })).toBeNull();
  });

  it("asks inside the button before it ends the game", async () => {
    const onEnd = vi.fn();
    const user = await renderView(language, onEnd);
    await user.click(screen.getByRole("button", { name: /End game|Spiel beenden/ }));
    expect(onEnd).not.toHaveBeenCalled();
    expect(screen.queryByRole("alertdialog")).toBeNull();
    await new Promise((resolve) => setTimeout(resolve, 450));
    await user.click(screen.getByRole("button", { name: /Tap again|Nochmal tippen/ }));
    expect(onEnd).toHaveBeenCalledTimes(1);
  });
});

/**
 * Walks through the role reveal, the begin and the wolves (a role is woken by a tap on its box, finished with "done" and
 * followed by "next") until the box of the seer says that the seer wakes up.
 */
async function toSeer(user: ReturnType<typeof userEvent.setup>) {
  for (let guard = 0; guard < 60 && !screen.queryByText(/seer wakes up/); guard += 1) {
    const next = screen.queryByRole("button", { name: "Next" });
    const done = screen.queryByRole("button", { name: "Task done" });
    const wake = document.querySelector(".ww-script__wake:not(:disabled)");
    if (screen.queryByText("All roles are dealt")) await beginGame(user);
    else if (wake) await user.click(document.querySelector(".ww-script__wake")!);
    else if (done && !(done as HTMLButtonElement).disabled) await user.click(done);
    else if (next && !(next as HTMLButtonElement).disabled) await user.click(next);
    else throw new Error("the walk to the seer is stuck");
  }
}

describe("NarratorView choices", () => {
  it("lets the narrator choose a person for the seer, confirm with the check mark and read what the seer sees", async () => {
    const user = await renderView("en");
    await toSeer(user);
    await user.click(document.querySelector(".ww-script__wake")!);
    // Inside the step of a role the button "next" waits: it changes the role.
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: /Look: ready/ }));
    const person = names.split(",").find((name) => screen.queryByRole("button", { name }))!;
    await user.click(screen.getByRole("button", { name: person }));
    expect(screen.getByRole("button", { name: "Undo" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Confirm the choice" }));
    expect(document.querySelector(".ww-guide__chosen")?.textContent).toMatch(
      new RegExp("Looked at: " + person + " [(](Not a werewolf|Werewolf)[)]"),
    );
    // The result stands in the summary box with a thumb: green and up for a werewolf, red and down if not.
    expect(document.querySelector(".ww-guide__chosen .ww-verdict svg")).not.toBeNull();
    // The script does not hold the result, it says what the narrator does.
    expect(document.querySelector(".ww-script")?.textContent).toContain("with a thumb");
    // When the seer falls asleep, the box names what was chosen, not "nothing chosen".
    await user.click(screen.getByRole("button", { name: "Task done" }));
    // The summary shows the symbol, the name of the ability and the person: no prefix.
    expect(document.querySelector(".ww-guide__chosen")?.textContent).toContain(
      `Looked at: ${person} (`,
    );
    expect(document.querySelector(".ww-guide__chosen svg")).not.toBeNull();
    expect(screen.queryByText(/the role passes/)).toBeNull();
  });

  it("lists the people in alphabetical order, all equally, and closes the list with the X", async () => {
    const user = await renderView("en");
    await toSeer(user);
    await user.click(document.querySelector(".ww-script__wake")!);
    await user.click(screen.getByRole("button", { name: /Look: ready/ }));
    const people = screen
      .getAllByRole("button")
      .filter((button) => button.classList.contains("ww-person"))
      .map((button) => button.textContent ?? "");
    expect(people.length).toBeGreaterThan(5);
    expect(people).toEqual([...people].sort((a, b) => a.localeCompare(b)));
    await user.click(screen.getByRole("button", { name: "Close the selection" }));
    expect(
      screen.queryAllByRole("button").filter((button) => button.classList.contains("ww-person")),
    ).toHaveLength(0);
  });

  it("leads the narrator with a blue frame: the ability, then the check mark once the choice is complete", async () => {
    const user = await renderView("en");
    await toSeer(user);
    // The box to tap stands alone: there is no second button inside it that does the same as "Next".
    expect(screen.queryByText(/^Show the role$/)).toBeNull();
    await user.click(document.querySelector(".ww-script__wake")!);
    const look = screen.getByRole("button", { name: /Look: ready/ });
    // First the ability has the frame; the check mark is only there while people are chosen.
    expect(look).toHaveAttribute("data-next");
    expect(screen.queryByRole("button", { name: "Confirm the choice" })).toBeNull();
    await user.click(look);
    // In the list the reset and the X are always there; the check waits for the choice.
    expect(screen.getByRole("button", { name: "Undo" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Close the selection" })).toBeEnabled();
    expect(look).not.toHaveAttribute("data-next");
    const confirm = screen.getByRole("button", { name: "Confirm the choice" });
    expect(confirm).toBeDisabled();
    expect(confirm).not.toHaveAttribute("data-next");
    const person = names.split(",").find((name) => screen.queryByRole("button", { name }))!;
    await user.click(screen.getByRole("button", { name: person }));
    // The choice is complete: the check mark gets the frame and confirms.
    expect(confirm).toBeEnabled();
    expect(confirm).toHaveAttribute("data-next");
    await user.click(confirm);
    expect(document.querySelector(".ww-guide__chosen")?.textContent).toMatch(
      new RegExp("Looked at: " + person + " [(](Not a werewolf|Werewolf)[)]"),
    );
  });

  it("changes from one role to the next only with the button next, which then has the blue frame", async () => {
    const user = await renderView("en");
    await toSeer(user);
    await user.click(document.querySelector(".ww-script__wake")!);
    await user.click(screen.getByRole("button", { name: /Look: ready/ }));
    const person = names.split(",").find((name) => screen.queryByRole("button", { name }))!;
    await user.click(screen.getByRole("button", { name: person }));
    await user.click(screen.getByRole("button", { name: "Confirm the choice" }));
    // The result of the seer is read out, the step is confirmed with "done".
    await user.click(screen.getByRole("button", { name: "Task done" }));
    // The seer is asleep: the box only says so, a tap on it does nothing, and "next" leads on.
    const asleep = screen.getByText(/seer goes back to sleep/);
    await user.click(asleep);
    expect(screen.getByText(/seer goes back to sleep/)).toBeInTheDocument();
    const next = screen.getByRole("button", { name: "Next" });
    expect(next).toBeEnabled();
    expect(next).toHaveAttribute("data-next");
    await user.click(next);
    expect(screen.queryByText(/seer goes back to sleep/)).toBeNull();
  });

  it("tells the narrator that the werewolves attack only from night 2 when the setting says so", async () => {
    const user = await renderView("en");
    for (let guard = 0; guard < 30 && !screen.queryByText(/werewolves wake up/); guard += 1) {
      if (screen.queryByText("All roles are dealt")) await beginGame(user);
      else await user.click(screen.getByRole("button", { name: "Next" }));
    }
    await user.click(document.querySelector(".ww-script__wake")!);
    // The script says what the narrator does (the wolves look at each other); that they do not attack is a hint.
    expect(screen.getByText("Look at each other")).toBeInTheDocument();
    // No ability, so no symbol in front of the script (the wake box has the symbol of the role).
    expect(
      screen.getByText("Look at each other").closest(".ww-script__step")?.querySelector("svg"),
    ).toBeNull();
    expect(document.querySelector(".ww-guide__victim")?.textContent).toBe(
      "The werewolves attack only from night 2",
    );
    await user.click(screen.getByRole("button", { name: "Task done" }));
    expect(screen.getByText("No attack in this night")).toBeInTheDocument();
    expect(screen.queryByText(/the role passes/)).toBeNull();
  });

  it("takes a decision back with the small reset button in the summary, so the abilities work again", async () => {
    const user = await renderView("en");
    await toSeer(user);
    await user.click(document.querySelector(".ww-script__wake")!);
    await user.click(screen.getByRole("button", { name: /Look: ready/ }));
    const person = names.split(",").find((name) => screen.queryByRole("button", { name }))!;
    await user.click(screen.getByRole("button", { name: person }));
    await user.click(screen.getByRole("button", { name: "Confirm the choice" }));
    await user.click(screen.getByRole("button", { name: "Task done" }));
    // The role is asleep: the summary has the reset button; the abilities are switched off.
    const reset = screen.getByRole("button", { name: "Take the decision back" });
    expect(screen.getByRole("button", { name: /Look/ })).toBeDisabled();
    await user.click(reset);
    expect(screen.getByRole("button", { name: /Look: ready/ })).toBeEnabled();
    expect(screen.queryByRole("button", { name: "Take the decision back" })).toBeNull();
  });

  it("confirms the choice of people for a nomination with the check mark, and shows no note while people are chosen", async () => {
    const user = await renderView("en");
    for (
      let guard = 0;
      guard < 80 && !screen.queryByRole("button", { name: /^Nomination/ });
      guard += 1
    ) {
      const lookReady = screen.queryByRole("button", { name: /Look: ready/ });
      const confirm = screen.queryByRole("button", { name: "Confirm the choice" });
      const next = screen.queryByRole("button", { name: "Next" });
      const done = screen.queryByRole("button", { name: "Task done" });
      const wake = document.querySelector(".ww-script__wake:not(:disabled)");
      if (screen.queryByText("All roles are dealt")) await beginGame(user);
      else if (confirm && !(confirm as HTMLButtonElement).disabled) await user.click(confirm);
      else if (confirm) {
        const person = document.querySelector(".ww-person:not([aria-pressed='true'])")!;
        await user.click(person);
      } else if (done && !(done as HTMLButtonElement).disabled) await user.click(done);
      else if (lookReady && !(lookReady as HTMLButtonElement).disabled) await user.click(lookReady);
      else if (wake) await user.click(document.querySelector(".ww-script__wake")!);
      else if (next && !(next as HTMLButtonElement).disabled) await user.click(next);
      else throw new Error("the walk to the day is stuck");
    }
    // The day: the options (vote, no vote) can be used at once; no check mark while nothing is open.
    expect(screen.getByRole("button", { name: "No nomination" })).toBeEnabled();
    expect(screen.queryByRole("button", { name: "Confirm the choice" })).toBeNull();
    await user.click(screen.getByRole("button", { name: /^Nomination/ }));
    // The people are chosen: the check mark is there (switched off until the choice is complete).
    expect(screen.getByRole("button", { name: "Confirm the choice" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "No nomination" })).toBeDisabled();
    // One person is named: the check mark confirms, the vote starts with one row for every voter.
    await user.click(document.querySelector(".ww-person")!);
    expect(screen.getByRole("button", { name: "Confirm the choice" })).toBeEnabled();
    await user.click(screen.getByRole("button", { name: "Confirm the choice" }));
    // One nominated person: the question is yes or no about him (not "everybody votes for a nominated person").
    expect(screen.getByText(/^Who votes for .* to leave the game\?$/)).toBeInTheDocument();
    // The yes votes are entered in the lower box; the upper box shows the sum; he needs more than half of all votes.
    expect(document.querySelectorAll(".ww-nominee")).toHaveLength(1);
    expect(document.querySelector(".ww-vote__sum")!.textContent).toContain(
      "Yes votes: 0 (more than half",
    );
    // Any number of yes votes can be confirmed (no yes vote at all is a valid result).
    expect(screen.getByRole("button", { name: "Confirm the choice" })).toBeEnabled();
    // The number is the yes votes: a label in the row says so.
    expect(document.querySelector(".ww-nominee__yes")?.textContent).toBe("Yes");
    // The vote can be broken off with the button in the lower box (back to the nomination); then it is made once more.
    expect(screen.getByRole("button", { name: "Cancel the vote" })).toBeEnabled();
    await user.click(screen.getByRole("button", { name: "Cancel the vote" }));
    expect(document.querySelectorAll(".ww-nominee")).toHaveLength(0);
    expect(document.querySelectorAll(".ww-person").length).toBeGreaterThan(5);
    await user.click(screen.getByRole("button", { name: "Confirm the choice" }));
    expect(document.querySelectorAll(".ww-nominee")).toHaveLength(1);
    const more = document.querySelector<HTMLButtonElement>(".ww-nominee__count button:last-child")!;
    await user.click(more);
    expect(document.querySelector(".ww-vote__sum")!.textContent).toContain("Yes votes: 1 ");
    expect(screen.getByRole("button", { name: "Confirm the choice" })).toBeEnabled();
    // The vote is confirmed with the check mark only: the button "next" waits.
    expect(screen.getByRole("button", { name: /^End the vote|Next/ })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Confirm the choice" }));
    // After the vote the narrator is back at the script of the day (one yes vote is not enough: nobody leaves).
    expect(screen.getByRole("button", { name: /^Nomination/ })).toBeInTheDocument();
    expect(document.body.textContent).toContain("Nominate somebody?");
    expect(document.querySelector(".ww-guide__causes")).toBeNull();
  });
});
