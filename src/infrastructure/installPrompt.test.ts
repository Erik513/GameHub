import { describe, expect, it, vi } from "vitest";
import { createInstallPrompt, detectInstallDevice } from "./installPrompt";

function fakeWindow(options: {
  standalone?: boolean;
  navigatorStandalone?: boolean;
  userAgent?: string;
  platform?: string;
  touchPoints?: number;
  withMatchMedia?: boolean;
}) {
  const target = new EventTarget();
  const fake = Object.assign(target, {
    matchMedia:
      options.withMatchMedia === false
        ? undefined
        : (query: string) => ({ matches: query.includes("standalone") && !!options.standalone }),
    navigator: {
      maxTouchPoints: options.touchPoints ?? 0,
      platform: options.platform ?? "Win32",
      standalone: options.navigatorStandalone,
      userAgent: options.userAgent ?? "Mozilla/5.0 (Windows NT 10.0) Chrome",
    },
  });
  return fake as unknown as Window & typeof globalThis;
}

function offerEvent() {
  const event = new Event("beforeinstallprompt", { cancelable: true }) as Event & {
    prompt: () => Promise<void>;
    userChoice: Promise<unknown>;
  };
  event.prompt = vi.fn(() => Promise.resolve());
  event.userChoice = Promise.resolve({ outcome: "accepted" });
  return event;
}

describe("detectInstallDevice", () => {
  it("tells iPhone and iPad (also an iPad that calls itself a Mac), Android and a computer apart", () => {
    expect(detectInstallDevice("Mozilla/5.0 (iPhone; CPU iPhone OS 17)", "iPhone", 5)).toBe("ios");
    expect(detectInstallDevice("Mozilla/5.0 (Macintosh)", "MacIntel", 5)).toBe("ios");
    expect(detectInstallDevice("Mozilla/5.0 (Macintosh)", "MacIntel", 0)).toBe("desktop");
    expect(detectInstallDevice("Mozilla/5.0 (Linux; Android 14)", "Linux armv8l", 5)).toBe(
      "android",
    );
    expect(detectInstallDevice("Mozilla/5.0 (Windows NT 10.0)", "Win32", 0)).toBe("desktop");
  });
});

describe("createInstallPrompt", () => {
  it("knows the device and that the app does not run installed", () => {
    const prompt = createInstallPrompt(
      fakeWindow({ userAgent: "Mozilla/5.0 (Linux; Android 14)" }),
    );
    expect(prompt.device).toBe("android");
    expect(prompt.isInstalled()).toBe(false);
    expect(prompt.canPrompt()).toBe(false);
  });

  it("knows that the app runs installed (display mode or Safari flag)", () => {
    expect(createInstallPrompt(fakeWindow({ standalone: true })).isInstalled()).toBe(true);
    expect(createInstallPrompt(fakeWindow({ navigatorStandalone: true })).isInstalled()).toBe(true);
    expect(createInstallPrompt(fakeWindow({ withMatchMedia: false })).isInstalled()).toBe(false);
  });

  it("catches the offer of the browser, tells the listeners and installs with one tap", async () => {
    const target = fakeWindow({});
    const prompt = createInstallPrompt(target);
    const listener = vi.fn();
    const stop = prompt.subscribe(listener);
    const before = prompt.snapshot();

    const event = offerEvent();
    target.dispatchEvent(event);
    // The browser's own bar is not shown: the app offers the installation itself.
    expect(event.defaultPrevented).toBe(true);
    expect(prompt.canPrompt()).toBe(true);
    expect(prompt.snapshot()).not.toBe(before);
    expect(listener).toHaveBeenCalledTimes(1);

    expect(await prompt.promptInstall()).toBe(true);
    expect(event.prompt).toHaveBeenCalledTimes(1);
    // An offer can be used once.
    expect(prompt.canPrompt()).toBe(false);
    expect(await prompt.promptInstall()).toBe(false);

    stop();
    target.dispatchEvent(offerEvent());
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it("is installed after the browser reports the installation and drops the offer", () => {
    const target = fakeWindow({});
    const prompt = createInstallPrompt(target);
    target.dispatchEvent(offerEvent());
    target.dispatchEvent(new Event("appinstalled"));
    expect(prompt.isInstalled()).toBe(true);
    expect(prompt.canPrompt()).toBe(false);
  });

  it("goes on when the choice of the person cannot be read", async () => {
    const target = fakeWindow({});
    const prompt = createInstallPrompt(target);
    const event = offerEvent();
    event.userChoice = Promise.reject(new Error("closed"));
    target.dispatchEvent(event);
    expect(await prompt.promptInstall()).toBe(true);
  });
});
