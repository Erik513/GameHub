import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nextProvider } from "react-i18next";
import { expect, it } from "vitest";
import type { InstallDevice, InstallPrompt } from "../../infrastructure/installPrompt";
import { createGameHubI18n } from "../../i18n";
import { InstallGuide } from "./InstallGuide";
import { InstallProvider } from "./InstallProvider";

function fakePrompt(device: InstallDevice, state: { installed?: boolean; offer?: boolean } = {}) {
  let installed = state.installed ?? false;
  let offer = state.offer ?? false;
  const listeners = new Set<() => void>();
  const prompt: InstallPrompt & { calls: number; install: () => void } = {
    calls: 0,
    canPrompt: () => offer,
    device,
    install: () => {
      installed = true;
      for (const listener of listeners) listener();
    },
    isInstalled: () => installed,
    promptInstall: () => {
      prompt.calls += 1;
      const had = offer;
      offer = false;
      return Promise.resolve(had);
    },
    snapshot: () => `${String(installed)}|${String(offer)}`,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
  return prompt;
}

async function renderGuide(language: "en" | "de", prompt: InstallPrompt | undefined) {
  const i18n = await createGameHubI18n(language);
  render(
    <I18nextProvider i18n={i18n}>
      <InstallProvider prompt={prompt}>
        <InstallGuide />
      </InstallProvider>
    </I18nextProvider>,
  );
  return userEvent.setup();
}

const texts = {
  en: {
    open: "Install app",
    android: "Open this page in Chrome.",
    ios: "Open this page in Safari.",
    desktop: "In Chrome or Edge, click the install icon in the address bar.",
    auto: "Install automatically",
    unavailable: "Your browser does not offer the installation right now",
  },
  de: {
    open: "App installieren",
    android: "Öffne die Seite in Chrome.",
    ios: "Öffne die Seite in Safari.",
    desktop: "Klicke in Chrome oder Edge in der Adressleiste auf das Installieren-Symbol.",
    auto: "Automatisch installieren",
    unavailable: "Dein Browser bietet die Installation gerade nicht an",
  },
} as const;

const tabNames = { android: "Android", ios: "iPhone / iPad", desktop: "Computer" } as const;

it.each([
  ["en", "android"],
  ["en", "ios"],
  ["en", "desktop"],
  ["de", "android"],
  ["de", "ios"],
  ["de", "desktop"],
] as const)(
  "opens a window with the tab of the device in use first (%s, %s)",
  async (language, device) => {
    const t = texts[language];
    const user = await renderGuide(language, fakePrompt(device));
    await user.click(screen.getByRole("button", { name: t.open }));
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByRole("tab", { selected: true })).toHaveTextContent(tabNames[device]);
    expect(dialog).toHaveTextContent(t[device]);
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  },
);

it("shows the other devices on their tabs and installs with one tap where the browser offers it", async () => {
  const prompt = fakePrompt("android", { offer: true });
  const user = await renderGuide("en", prompt);
  await user.click(screen.getByRole("button", { name: "Install app" }));
  const dialog = screen.getByRole("dialog");
  await user.click(within(dialog).getByRole("tab", { name: "iPhone / iPad" }));
  expect(within(dialog).getByRole("tab", { selected: true })).toHaveTextContent("iPhone / iPad");
  await user.click(within(dialog).getByRole("tab", { name: "Android" }));
  await user.click(within(dialog).getByRole("button", { name: "Install automatically" }));
  expect(prompt.calls).toBe(1);
  expect(within(dialog).queryByRole("alert")).not.toBeInTheDocument();
});

it.each(["en", "de"] as const)(
  "tells that the browser does not offer the installation right now in %s",
  async (language) => {
    const t = texts[language];
    const user = await renderGuide(language, fakePrompt("android"));
    await user.click(screen.getByRole("button", { name: t.open }));
    await user.click(screen.getByRole("button", { name: t.auto }));
    expect(screen.getByRole("alert")).toHaveTextContent(t.unavailable);
  },
);

it("shows no button when the app runs installed or has no prompt, and hides it after the installation", async () => {
  const installed = fakePrompt("desktop", { installed: true });
  await renderGuide("en", installed);
  expect(screen.queryByRole("button", { name: "Install app" })).not.toBeInTheDocument();
  document.body.innerHTML = "";

  await renderGuide("en", undefined);
  expect(screen.queryByRole("button", { name: "Install app" })).not.toBeInTheDocument();
  document.body.innerHTML = "";

  const prompt = fakePrompt("desktop");
  await renderGuide("en", prompt);
  expect(screen.getByRole("button", { name: "Install app" })).toBeInTheDocument();
  act(() => prompt.install());
  expect(screen.queryByRole("button", { name: "Install app" })).not.toBeInTheDocument();
});
