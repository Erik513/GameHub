import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "../components";
import { DealCard } from "./DealCard";
import type { DealtRole, RoleVariant } from "./roleAbilities";

interface TrueRoleWindowProps {
  /** The drunk, whom the narrator shows his true role. */
  readonly name: string;
  readonly role: DealtRole;
  readonly amulet: boolean;
  readonly mayor: "doubleVote" | "hammer";
  readonly variant: RoleVariant | null;
  readonly onClose: () => void;
}

/**
 * The full-screen window with the card of the true role of the drunk: the narrator holds the device towards him, and
 * closes the window with the cross at the top right once he has read it.
 */
export function TrueRoleWindow({
  name,
  role,
  amulet,
  mayor,
  variant,
  onClose,
}: TrueRoleWindowProps) {
  const { t } = useTranslation();
  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [onClose]);
  return (
    <div
      aria-label={t("werewolfNarrator.guide.trueRole.show")}
      aria-modal="true"
      className="ww-truerole"
      role="dialog"
    >
      <button
        aria-label={t("werewolfNarrator.guide.trueRole.close")}
        className="ww-truerole__close"
        onClick={onClose}
        title={t("werewolfNarrator.guide.trueRole.close")}
        type="button"
      >
        <Icon name="close" />
      </button>
      <DealCard
        amulet={amulet}
        mayor={mayor}
        name={name}
        open
        position={1}
        role={role}
        total={1}
        variant={variant}
      />
    </div>
  );
}
