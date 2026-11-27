import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { GameModuleDescriptor } from "../app/gameCatalog";
import { Card } from "./components";

interface GamePreviewPageProps {
  children?: ReactNode;
  game: GameModuleDescriptor;
}

export function GamePreviewPage({ children, game }: GamePreviewPageProps) {
  const { t } = useTranslation();

  return (
    <Card
      className={children ? "game-preview game-preview--playable" : "game-preview"}
      data-accent={game.accent}
      data-game={game.id}
    >
      <h1>{t(`games.${game.translationKey}.title`)}</h1>
      {children ?? <p>{t("gamePreview.description")}</p>}
    </Card>
  );
}
