import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { GameModuleDescriptor } from "../app/gameCatalog";
import { Button, Card } from "./components";

interface GamePreviewPageProps {
  children?: ReactNode;
  game: GameModuleDescriptor;
  onBack: () => void;
}

export function GamePreviewPage({ children, game, onBack }: GamePreviewPageProps) {
  const { t } = useTranslation();

  return (
    <Card
      className={children ? "game-preview game-preview--playable" : "game-preview"}
      data-accent={game.accent}
    >
      <h1>{t(`games.${game.translationKey}.title`)}</h1>
      {children ?? <p>{t("gamePreview.description")}</p>}
      <Button className="game-preview__back" variant="quiet" onClick={onBack}>
        {t("gamePreview.back")}
      </Button>
    </Card>
  );
}
