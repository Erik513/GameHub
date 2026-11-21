import { useTranslation } from "react-i18next";
import { InfoButton } from "../game-kit";
import { infoOfRole, type DealtRole, type RoleVariant } from "./roleAbilities";
import { teamOf } from "./roleTeam";
import { WerewolfSymbol } from "./symbols/WerewolfSymbol";

interface RoleCardInfoProps {
  readonly role: DealtRole;
  /** The option the role is played with in this game; its sentence stands at the end. */
  readonly variant: RoleVariant | null;
  /** The player holds the protective amulet: its rules are added. */
  readonly amulet: boolean;
  readonly className?: string;
}

/**
 * The "i" of the role card during the game: a few short sentences for the player about their own role, without any
 * of the notes for the setup of the game (those stay in the info windows of the configuration). The drunk does not
 * learn on which side they are.
 */
export function RoleCardInfo({ role, variant, amulet, className }: RoleCardInfoProps) {
  const { i18n, t } = useTranslation();
  const roleName = t(`werewolfSymbols.items.${role}.name`);
  const lines = (key: string): readonly string[] =>
    i18n.exists(key)
      ? t(key as "werewolfRoleInfo.amulet")
          .split("\n")
          .filter((line) => line !== "")
      : [];
  const sentences = [
    ...lines(`werewolfRoleInfo.roles.${role}.lines`),
    ...(variant ? lines(`werewolfRoleInfo.variants.${variant}`) : []),
  ];
  return (
    <InfoButton
      {...(className === undefined ? {} : { className })}
      closeLabel={t("werewolfConfig.infoClose")}
      label={t("werewolfConfig.infoLabel", { name: roleName })}
      {...(role === "drunk" ? {} : { subtitle: teamOf(infoOfRole(role), t) })}
      text={
        <>
          <ul className="kit-info-list">
            {sentences.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          {amulet && (
            <ul className="kit-info-list">
              {lines("werewolfRoleInfo.amulet").map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          )}
        </>
      }
      title={roleName}
      titleExtra={<WerewolfSymbol id={role} size={28} />}
    />
  );
}
