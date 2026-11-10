import { useTranslation } from "react-i18next";
import type { GameModuleDescriptor } from "../app/gameCatalog";
import { Button, Card } from "./components";

interface GamePreviewPageProps {
  game: GameModuleDescriptor;
  onBack: () => void;
}

export function GamePreviewPage({ game, onBack }: GamePreviewPageProps) {
  const { t } = useTranslation();

  return (
    <Card className="game-preview" data-accent={game.accent}>
      <p className="eyebrow">{t("gamePreview.eyebrow")}</p>
      <span className="game-status" data-status={game.availability}>
        {t(`gameSelection.status.${game.availability}`)}
      </span>
      <h1>{t(`games.${game.translationKey}.title`)}</h1>
      <p>{t("gamePreview.description")}</p>
      <Button variant="secondary" onClick={onBack}>
        {t("gamePreview.back")}
      </Button>
    </Card>
  );
}
