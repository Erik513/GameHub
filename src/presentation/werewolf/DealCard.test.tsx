import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nextProvider } from "react-i18next";
import { describe, expect, it } from "vitest";
import { createGameHubI18n } from "../../i18n";
import { DealCard } from "./DealCard";
import type { RoleVariant } from "./roleAbilities";

async function renderCard(language: "en" | "de", variant: RoleVariant | null) {
  const i18n = await createGameHubI18n(language);
  const user = userEvent.setup();
  render(
    <I18nextProvider i18n={i18n}>
      <DealCard
        amulet={false}
        mayor="doubleVote"
        name="Anna"
        position={2}
        role="hunter"
        total={20}
        variant={variant}
      />
    </I18nextProvider>,
  );
  return user;
}

describe("DealCard", () => {
  it.each([
    { language: "de", required: "Schusspflicht", optional: "Keine Schusspflicht" },
    { language: "en", required: "Duty to shoot", optional: "No duty to shoot" },
  ] as const)(
    "names how the role is played, in $language",
    async ({ language, optional, required }) => {
      for (const [variant, text] of [
        ["required", required],
        ["optional", optional],
      ] as const) {
        const user = await renderCard(language, variant);
        expect(screen.queryByText(text)).toBeNull();
        await user.click(screen.getByRole("button", { pressed: false }));
        expect(screen.getByText(text)).toBeInTheDocument();
        document.body.innerHTML = "";
      }
    },
  );

  it("shows no label for a role without options", async () => {
    const user = await renderCard("en", null);
    await user.click(screen.getByRole("button", { pressed: false }));
    expect(document.querySelector(".ww-deal__variant")).toBeNull();
  });

  it.each([
    {
      language: "de",
      info: /Info zu Jäger/,
      shoot: "Wenn du ausscheidest, schießt du auf eine lebende Person.",
      duty: "Du musst schießen.",
    },
    {
      language: "en",
      info: /Info about Hunter/i,
      shoot: "When you leave the game, you shoot at a living person.",
      duty: "You have to shoot.",
    },
  ] as const)(
    "explains the role in a few sentences for the player in $language",
    async ({ duty, info, language, shoot }) => {
      const user = await renderCard(language, "required");
      await user.click(screen.getByRole("button", { pressed: false }));
      await user.click(screen.getByRole("button", { name: info }));
      const dialog = await screen.findByRole("dialog");
      expect(dialog).toHaveTextContent(shoot);
      expect(dialog).toHaveTextContent(duty);
      // Nothing about the setup of the game.
      expect(dialog.textContent).not.toMatch(
        /Konfiguration|Empfehlung|configuration|recommendation|Wähle, wie viele|how many/i,
      );
    },
  );

  it.each([
    {
      language: "de",
      hammer: "Nichts schützt vor dem Hammer",
      vote: "Deine Stimme zählt bei Abstimmungen doppelt.",
    },
    {
      language: "en",
      hammer: "Nothing protects from the hammer",
      vote: "Your vote counts twice in votes.",
    },
  ] as const)(
    "explains the hammer and the double vote of the mayor in $language",
    async ({ hammer, language, vote }) => {
      for (const mayor of ["hammer", "doubleVote"] as const) {
        const i18n = await createGameHubI18n(language);
        const user = userEvent.setup();
        const { unmount } = render(
          <I18nextProvider i18n={i18n}>
            <DealCard
              amulet={false}
              mayor={mayor}
              name="Anna"
              position={1}
              role="mayor"
              total={20}
              variant={null}
            />
          </I18nextProvider>,
        );
        await user.click(screen.getByRole("button", { pressed: false }));
        await user.click(screen.getByRole("button", { name: /Info/ }));
        const dialog = await screen.findByRole("dialog");
        expect(dialog).toHaveTextContent(mayor === "hammer" ? hammer : vote);
        expect(dialog.textContent).not.toContain(mayor === "hammer" ? vote : hammer);
        unmount();
        document.body.innerHTML = "";
      }
    },
  );

  it("shows a question mark for the abilities of the drunk, who does not know them yet", async () => {
    const i18n = await createGameHubI18n("en");
    const user = userEvent.setup();
    render(
      <I18nextProvider i18n={i18n}>
        <DealCard
          amulet={false}
          mayor="doubleVote"
          name="Anna"
          position={1}
          role="drunk"
          total={9}
          variant={null}
        />
      </I18nextProvider>,
    );
    await user.click(screen.getByRole("button", { name: /Tap/ }));
    expect(screen.getByText("?")).toBeInTheDocument();
    expect(screen.getByText("Unknown")).toBeInTheDocument();
    expect(screen.queryByText("No special ability")).toBeNull();
  });
});

it("marks the card as seen once it was uncovered, also when it is covered again to pass it on", async () => {
  const user = await renderCard("en", null);
  const card = document.querySelector(".ww-deal")!;
  // Not seen yet: the button "next" has no blue frame (see the style of the narrator view).
  expect(card).not.toHaveAttribute("data-seen");
  await user.click(document.querySelector(".ww-deal__face")!);
  expect(card).toHaveAttribute("data-seen", "true");
  await user.click(document.querySelector(".ww-deal__face")!);
  expect(card).toHaveAttribute("data-shown", "false");
  expect(card).toHaveAttribute("data-seen", "true");
});

describe("DealCard pictures", () => {
  it("shows the back while covered and the picture of the role when shown, without the big symbol", async () => {
    const user = await renderCard("en", null);
    const face = screen.getByRole("button", { pressed: false });
    expect(face).toHaveAttribute("data-art", "back");
    expect(face.style.backgroundImage).toContain("back.jpg");
    await user.click(face);
    expect(face).toHaveAttribute("data-art", "front");
    expect(face.style.backgroundImage).toContain("hunter.jpg");
    // The picture shows the role: the big symbol of the role is left out, the name and abilities stay.
    expect(face.querySelector(".ww-deal__role")).toBeNull();
    expect(face).toHaveTextContent("Hunter");
  });
});
