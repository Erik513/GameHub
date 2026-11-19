import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { WerewolfLineup } from "../../business/games/werewolf/lineup";
import { Button, Dialog } from "../components";
import { InfoButton, OrderList, TabPane } from "../game-kit";
import { SeatCircle } from "./SeatCircle";
import { SeatExample } from "./SeatExample";

interface SeatsTabProps {
  readonly lineup: WerewolfLineup;
  readonly onMove: (name: string, toIndex: number) => void;
}

/**
 * The tab "Seats": at the top (it stays there while the list scrolls) a button that opens the seat
 * circle in a window and an info button for the explanation, and under them the list of the names
 * in which the order is set (the same reorder list as the playing order of the teams). Seat 1 is right
 * next to the narrator on the left, the others follow clockwise.
 */
export function SeatsTab({ lineup, onMove }: SeatsTabProps) {
  const { t } = useTranslation();
  const [circleOpen, setCircleOpen] = useState(false);

  // The seats only make sense with the narrator (who has the fixed place) and the players.
  if (lineup.seats.length === 0 || lineup.narrator === null)
    return <p>{t("werewolfLineup.seatsEmpty")}</p>;
  return (
    <TabPane
      header={
        <div className="ww-seats-header">
          <Button onClick={() => setCircleOpen(true)} variant="secondary">
            {t("werewolfLineup.circleOpen")}
          </Button>
          <InfoButton
            closeLabel={t("settings.close")}
            label={t("werewolfLineup.seatsInfoLabel")}
            text={
              <>
                <p>{t("werewolfLineup.seatsHint")}</p>
                <SeatExample />
              </>
            }
            title={t("werewolfLineup.seatsInfoTitle")}
          />
        </div>
      }
    >
      <OrderList
        items={lineup.seats.map((name) => ({ key: name, label: name }))}
        moveLabel={(_place, name) => t("werewolfLineup.move", { player: name })}
        onMove={(name, toIndex) => {
          const target = Math.min(Math.max(toIndex, 0), lineup.seats.length - 1);
          if (target !== lineup.seats.indexOf(name)) onMove(name, target);
        }}
      />
      <Dialog
        closeLabel={t("settings.close")}
        onClose={() => setCircleOpen(false)}
        open={circleOpen}
        title={t("werewolfLineup.circleTitle")}
      >
        <SeatCircle narrator={lineup.narrator} seats={lineup.seats} />
      </Dialog>
    </TabPane>
  );
}
