import type { ReactNode } from "react";
import type { InstallPrompt } from "../../infrastructure/installPrompt";
import { InstallContext } from "./InstallContext";

/** Gives the screens the installation prompt; without it (for example in tests) there is no install guide. */
export function InstallProvider({
  children,
  prompt,
}: {
  readonly children: ReactNode;
  readonly prompt: InstallPrompt | undefined;
}) {
  return <InstallContext.Provider value={prompt}>{children}</InstallContext.Provider>;
}
