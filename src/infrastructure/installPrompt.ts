export type InstallDevice = "android" | "ios" | "desktop";

/** The browser's own event that offers the installation (Chrome, Edge and Android browsers). */
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<unknown>;
}

/**
 * What the app knows about installing itself as an app. The browser decides whether it offers the
 * installation; the guide only needs to know the device, whether the app is installed and whether a
 * one-tap installation is available right now.
 */
export interface InstallPrompt {
  readonly device: InstallDevice;
  /** Whether the app runs installed (or was installed during this visit). */
  isInstalled(): boolean;
  /** Whether the browser offers the installation by one tap right now. */
  canPrompt(): boolean;
  /** Opens the browser's installation window; false when the browser does not offer it. */
  promptInstall(): Promise<boolean>;
  /** A value that changes whenever `isInstalled` or `canPrompt` changes. */
  snapshot(): string;
  subscribe(listener: () => void): () => void;
}

/** The device the guide shows first: iPhone and iPad (also an iPad that calls itself a Mac), Android, or a computer. */
export function detectInstallDevice(
  userAgent: string,
  platform: string,
  touchPoints: number,
): InstallDevice {
  if (/iphone|ipad|ipod/i.test(userAgent) || (platform === "MacIntel" && touchPoints > 1))
    return "ios";
  return /android/i.test(userAgent) ? "android" : "desktop";
}

/**
 * Listens to the browser's installation events from the start of the page (the browser fires the offer
 * once, early, so it has to be caught before the screen that needs it exists).
 */
export function createInstallPrompt(target: Window & typeof globalThis = window): InstallPrompt {
  const standalone = (): boolean =>
    (typeof target.matchMedia === "function" &&
      target.matchMedia("(display-mode: standalone)").matches) ||
    (target.navigator as Navigator & { standalone?: boolean }).standalone === true;

  let installed = standalone();
  let offer: BeforeInstallPromptEvent | null = null;
  const listeners = new Set<() => void>();
  const notify = () => {
    for (const listener of listeners) listener();
  };

  target.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    offer = event as BeforeInstallPromptEvent;
    notify();
  });
  target.addEventListener("appinstalled", () => {
    installed = true;
    offer = null;
    notify();
  });

  return {
    canPrompt: () => offer !== null,
    device: detectInstallDevice(
      target.navigator.userAgent,
      target.navigator.platform,
      target.navigator.maxTouchPoints,
    ),
    isInstalled: () => installed,
    async promptInstall() {
      const current = offer;
      if (!current) return false;
      offer = null;
      notify();
      await current.prompt();
      await current.userChoice.catch(() => undefined);
      return true;
    },
    snapshot: () => `${String(installed)}|${String(offer !== null)}`,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
