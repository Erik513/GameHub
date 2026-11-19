import { createContext, useContext, useSyncExternalStore } from "react";
import type { InstallPrompt } from "../../infrastructure/installPrompt";

export const InstallContext = createContext<InstallPrompt | undefined>(undefined);

const noSubscription = () => () => undefined;

/** The prompt with its current state, or nothing when the app has no prompt (then there is no install guide). */
export function useInstall(): { readonly prompt: InstallPrompt } | undefined {
  const prompt = useContext(InstallContext);
  useSyncExternalStore(prompt ? (listener) => prompt.subscribe(listener) : noSubscription, () =>
    prompt ? prompt.snapshot() : "",
  );
  return prompt ? { prompt } : undefined;
}
