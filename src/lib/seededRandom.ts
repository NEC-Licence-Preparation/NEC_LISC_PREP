/**
 * Seeded random number generator for deterministic shuffling
 * Based on date + faculty to ensure same set for all users same day
 */
function seededRandom(seed: string): number {
  const x = Math.sin(
    seed
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0)
  ) * 10000;
  return x - Math.floor(x);
}

/**
 * Fisher-Yates shuffle using seeded RNG
 */
export function seededShuffle<T>(
  array: T[],
  seed: string
): T[] {
  const copy = [...array];
  let randomIndex = 0;

  for (let i = copy.length - 1; i > 0; i--) {
    // Use seed + index to ensure different randomization at each step
    randomIndex = Math.floor(
      seededRandom(`${seed}-${i}`) * (i + 1)
    );
    [copy[i], copy[randomIndex]] = [copy[randomIndex], copy[i]];
  }

  return copy;
}

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getTodayDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Generate seed from date and faculty
 */
export function generateSeed(date: string, faculty: string): string {
  return `${date}::${faculty}`;
}
