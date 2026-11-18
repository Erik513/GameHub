/**
 * Shows the key of a keyboard shortcut at its button, for example "S" or "Space". It is only visible
 * at the PC (from 64 rem); on a phone there is no keyboard. Screen readers do not read it: the button
 * names the key with `aria-keyshortcuts` instead.
 */
export function ShortcutHint({ label }: { readonly label: string }) {
  return (
    <kbd aria-hidden="true" className="kit-shortcut-hint">
      {label}
    </kbd>
  );
}
