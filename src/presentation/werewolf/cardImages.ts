// The pictures of the cards of the role reveal (made with AI, see docs/GAMEHUB_WERWOLF_KARTENDESIGN.md): one back for
// all cards and one front per role. They are bundled with the app (and cached for offline play).
const images = import.meta.glob<string>("./cards/*.jpg", {
  eager: true,
  import: "default",
  query: "?url",
});

/** The picture of a card ("back" or the id of a role); undefined when there is none (the card shows its symbol). */
export function cardImage(id: string): string | undefined {
  return images[`./cards/${id}.jpg`];
}
