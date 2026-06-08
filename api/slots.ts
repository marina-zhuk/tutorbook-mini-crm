import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const url = process.env.GOOGLE_SCRIPT_URL;

  if (!url) {
    return res.status(200).json({ slots: [] });
  }

  try {
    const response = await fetch(url);
    const data = (await response.json()) as { ok: boolean; slots?: { date: string; time: string }[] };

    if (!data.ok || !Array.isArray(data.slots)) {
      return res.status(200).json({ slots: [] });
    }

    return res.status(200).json({ slots: data.slots });
  } catch {
    return res.status(200).json({ slots: [] });
  }
}
