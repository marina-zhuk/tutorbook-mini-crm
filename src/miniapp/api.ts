export type BookingPayload = {
  studentName: string;
  phone: string;
  lessonType: string;
  date: string;
  time: string;
  comment?: string;
  telegramUserId?: number;
};

export type BusySlot = { date: string; time: string };

export async function submitBooking(payload: BookingPayload): Promise<void> {
  const res = await fetch("/api/booking", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    let message = `Ошибка сервера: ${res.status}`;
    try {
      const data = (await res.json()) as { error?: string };
      if (data.error) message = data.error;
    } catch {
      // ignore parse error
    }
    throw new Error(message);
  }
}

export async function fetchBusySlots(): Promise<BusySlot[]> {
  try {
    const res = await fetch("/api/slots");
    if (!res.ok) return [];
    const data = (await res.json()) as { slots?: BusySlot[] };
    return data.slots ?? [];
  } catch {
    return [];
  }
}
