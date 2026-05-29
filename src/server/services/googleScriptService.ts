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
  _payload: GoogleScriptBookingPayload
) {
  const googleScriptUrl = getGoogleScriptUrl();

  if (!googleScriptUrl) {
    throw new Error("GOOGLE_SCRIPT_URL is not configured.");
  }

  throw new Error(
    "Google Apps Script booking sync is prepared but not implemented yet."
  );
}
