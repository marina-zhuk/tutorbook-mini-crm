export type GoogleScriptBookingPayload = {
  studentName: string;
  phone: string;
  lessonType: string;
  date: string;
  time: string;
  comment?: string;
};

export function getGoogleScriptUrl() {
  return process.env.GOOGLE_SCRIPT_URL;
}

export async function sendBookingToGoogleScript(
  payload: GoogleScriptBookingPayload
) {
  const googleScriptUrl = getGoogleScriptUrl();

  if (!googleScriptUrl) {
    throw new Error("GOOGLE_SCRIPT_URL is not configured.");
  }

  const res = await fetch(googleScriptUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    throw new Error(`Google Script responded with ${res.status}`);
  }
}
