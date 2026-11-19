import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { InstallDevice } from "../../infrastructure/installPrompt";
import { Button, Dialog, Icon } from "../components";
import { SetupTabs } from "../game-kit";
import { useInstall } from "./InstallContext";

/** The three dots of the menu of Android browsers, in the line of the step. */
function MenuDots() {
  return (
    <svg
      aria-label="⋮"
      className="install-guide__icon"
      fill="currentColor"
      height="16"
      role="img"
      viewBox="0 0 24 24"
      width="16"
    >
      <circle cx="12" cy="5" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="12" cy="19" r="2" />
    </svg>
  );
}

/** The share symbol of Safari. */
function ShareSymbol() {
  return (
    <svg
      aria-hidden="true"
      className="install-guide__icon"
      fill="none"
      focusable="false"
      height="16"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width="16"
    >
      <path d="M12 15V3" />
      <path d="M8 7l4-4 4 4" />
      <path d="M7 11H6a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1" />
    </svg>
  );
}

/**
 * The button "Install app" and its window: how to put the web page on the home screen as an app, in
 * short steps for Android, iPhone and iPad, and a computer (the tab of the device in use is chosen first).
 * Where the browser offers it, a button installs with one tap. The button is not shown when the app runs
 * installed already.
 */
export function InstallGuide() {
  const { t } = useTranslation();
  const install = useInstall();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<InstallDevice>("desktop");
  const [unavailable, setUnavailable] = useState(false);

  if (!install || install.prompt.isInstalled()) return null;
  const { prompt } = install;

  async function installNow() {
    setUnavailable(!(await prompt.promptInstall()));
  }

  const steps = (items: readonly ReactNode[]) => (
    <ol className="install-guide__steps">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ol>
  );

  return (
    <>
      <Button
        className="install-guide__open"
        onClick={() => {
          setTab(prompt.device);
          setUnavailable(false);
          setOpen(true);
        }}
        variant="secondary"
      >
        <Icon name="download" />
        {t("install.open")}
      </Button>
      <Dialog
        closeLabel={t("settings.close")}
        description={t("install.intro")}
        onClose={() => setOpen(false)}
        open={open}
        title={t("install.title")}
      >
        <SetupTabs
          ariaLabel={t("install.title")}
          onSelect={(id) => setTab(id as InstallDevice)}
          selected={tab}
          tabs={[
            {
              content: (
                <>
                  {steps([
                    t("install.androidOpen"),
                    <>
                      {t("install.androidMenu")} <MenuDots /> {t("install.androidMenuEnd")}
                    </>,
                    t("install.androidInstall"),
                  ])}
                  <p className="install-guide__or">{t("install.or")}</p>
                  <Button onClick={() => void installNow()} variant="success">
                    {t("install.auto")}
                  </Button>
                  {unavailable && <p role="alert">{t("install.unavailable")}</p>}
                </>
              ),
              id: "android",
              label: t("install.tabAndroid"),
            },
            {
              content: (
                <>
                  {steps([
                    t("install.iosOpen"),
                    <>
                      {t("install.iosShare")} <ShareSymbol />
                    </>,
                    t("install.iosAdd"),
                  ])}
                  <p>{t("install.iosTip")}</p>
                </>
              ),
              id: "ios",
              label: t("install.tabIos"),
            },
            {
              content: steps([t("install.desktopInstall")]),
              id: "desktop",
              label: t("install.tabDesktop"),
            },
          ]}
        />
        <p>{t("install.tip")}</p>
      </Dialog>
    </>
  );
}
