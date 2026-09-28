import { randomInt } from "node:crypto";

// No 0/O or 1/l/I: the manager passes it on, and the user types it once.
const ALPHABET = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/**
 * A one-time password: 20 characters from a 55-character alphabet (about 115
 * bits), in four groups of five so it can be read without error. It is
 * returned once to the manager who asked for it and is otherwise only ever
 * held as a bcrypt hash.
 */
export function oneTimePassword(): string {
  const chars = Array.from({ length: 20 }, () => ALPHABET[randomInt(ALPHABET.length)]);
  return [0, 5, 10, 15].map((i) => chars.slice(i, i + 5).join("")).join("-");
}
