/** The shortest time a notification stays, in milliseconds. */
export const shortestReadingTime = 5000;
/** The longest time a notification stays, in milliseconds. */
export const longestReadingTime = 15000;

/**
 * How long a notification with this many characters stays: a base time plus about 60 milliseconds
 * per character (a calm reading speed), never shorter than 5 and never longer than 15 seconds.
 */
export function readingTime(characters: number): number {
  const wanted = 3000 + 60 * Math.max(0, characters);
  return Math.min(longestReadingTime, Math.max(shortestReadingTime, wanted));
}
