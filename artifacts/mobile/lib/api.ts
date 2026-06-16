const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "";

async function get<T>(path: string): Promise<T> {
  const url = BASE_URL ? `${BASE_URL}${path}` : `/api${path}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${path}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  getMissions: () => get<unknown[]>("/missions"),
  getLessons: () => get<unknown[]>("/lessons"),
  getSimulations: () => get<unknown[]>("/simulations"),
};
