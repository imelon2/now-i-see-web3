import type { PublicClient } from "viem";

export function multiRace<T>(
  promises: Promise<{ result: T | null; client: PublicClient }>[]
): Promise<{ result: T; client: PublicClient } | null> {
  return new Promise((resolve) => {
    let resolved = false;
    let pending = promises.length;

    for (const p of promises) {
      p.then(({ result, client }) => {
        pending -= 1;
        if (!resolved && result !== null) {
          resolved = true;
          resolve({ result, client });
        } else if (pending === 0 && !resolved) {
          resolve(null);
        }
      }).catch(() => {
        pending -= 1;
        if (pending === 0 && !resolved) {
          resolve(null);
        }
      });
    }
  });
}
