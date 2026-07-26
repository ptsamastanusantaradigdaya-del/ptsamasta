import { describe, it, expect } from "vitest";

// Interface disalin untuk kebutuhan unit testing terisolasi
interface TestEvent {
  id: string;
  title: string;
  category: "Meeting" | "Project" | "Deadline" | "Event";
  pic?: string | null;
  tanggal: string;
  waktu: string;
  status: "Terjadwal" | "Sedang Berlangsung" | "Selesai" | "Dibatalkan";
}

// Logika jatuh tempo dari KalenderPage.tsx
const isNearDeadline = (tanggalStr: string, category: string, status: string, mockTodayStr?: string) => {
  if (category !== "Deadline" || status === "Selesai" || status === "Dibatalkan") return false;
  
  // Gunakan mockToday jika disediakan, agar pengujian independen terhadap waktu sekarang
  const today = mockTodayStr ? new Date(mockTodayStr) : new Date();
  today.setHours(0, 0, 0, 0);
  
  const eventDate = new Date(tanggalStr);
  eventDate.setHours(0, 0, 0, 0);
  
  const diffTime = eventDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays <= 3;
};

// Logika grouping dari KalenderPage.tsx
const groupEventsByDate = (eventsList: TestEvent[]) => {
  const groups: { [key: string]: TestEvent[] } = {};
  eventsList.forEach((e) => {
    if (!groups[e.tanggal]) {
      groups[e.tanggal] = [];
    }
    groups[e.tanggal].push(e);
  });
  return groups;
};

describe("Modul Kalender - Unit & Regression Tests", () => {
  
  it("should sort events chronologically by date and then time in ascending order", () => {
    const mockEvents: TestEvent[] = [
      { id: "1", title: "Event C", category: "Meeting", tanggal: "2026-04-20", waktu: "14:00", status: "Terjadwal" },
      { id: "2", title: "Event A", category: "Project", tanggal: "2026-04-16", waktu: "10:00", status: "Terjadwal" },
      { id: "3", title: "Event D", category: "Event", tanggal: "2026-04-20", waktu: "09:00", status: "Terjadwal" },
      { id: "4", title: "Event B", category: "Deadline", tanggal: "2026-04-18", waktu: "17:00", status: "Terjadwal" }
    ];

    const sorted = [...mockEvents].sort((a, b) => {
      const dateCompare = a.tanggal.localeCompare(b.tanggal);
      if (dateCompare !== 0) return dateCompare;
      return a.waktu.localeCompare(b.waktu);
    });

    expect(sorted[0].id).toBe("2"); // 2026-04-16 10:00
    expect(sorted[1].id).toBe("4"); // 2026-04-18 17:00
    expect(sorted[2].id).toBe("3"); // 2026-04-20 09:00 (tanggal sama, waktu lebih awal)
    expect(sorted[3].id).toBe("1"); // 2026-04-20 14:00 (tanggal sama, waktu lebih lambat)
  });

  it("should group events correctly by their dates", () => {
    const mockEvents: TestEvent[] = [
      { id: "1", title: "Event A", category: "Meeting", tanggal: "2026-04-16", waktu: "10:00", status: "Terjadwal" },
      { id: "2", title: "Event B", category: "Project", tanggal: "2026-04-16", waktu: "14:00", status: "Terjadwal" },
      { id: "3", title: "Event C", category: "Event", tanggal: "2026-04-18", waktu: "09:00", status: "Terjadwal" }
    ];

    const grouped = groupEventsByDate(mockEvents);
    
    expect(Object.keys(grouped)).toHaveLength(2);
    expect(grouped["2026-04-16"]).toHaveLength(2);
    expect(grouped["2026-04-18"]).toHaveLength(1);
    expect(grouped["2026-04-16"][0].title).toBe("Event A");
    expect(grouped["2026-04-16"][1].title).toBe("Event B");
    expect(grouped["2026-04-18"][0].title).toBe("Event C");
  });

  it("should detect near deadlines within 3 days", () => {
    const mockToday = "2026-04-15";

    // Jatuh tempo pas 3 hari lagi (2026-04-18)
    expect(isNearDeadline("2026-04-18", "Deadline", "Terjadwal", mockToday)).toBe(true);

    // Jatuh tempo hari ini (2026-04-15)
    expect(isNearDeadline("2026-04-15", "Deadline", "Terjadwal", mockToday)).toBe(true);

    // Jatuh tempo besok (2026-04-16)
    expect(isNearDeadline("2026-04-16", "Deadline", "Terjadwal", mockToday)).toBe(true);

    // Jatuh tempo 4 hari lagi (2026-04-19) -> false
    expect(isNearDeadline("2026-04-19", "Deadline", "Terjadwal", mockToday)).toBe(false);

    // Jatuh tempo sudah lewat (2026-04-14) -> false
    expect(isNearDeadline("2026-04-14", "Deadline", "Terjadwal", mockToday)).toBe(false);
  });

  it("should NOT flag near deadline if event category is not Deadline or status is Selesai/Dibatalkan", () => {
    const mockToday = "2026-04-15";
    const targetDate = "2026-04-16"; // 1 hari lagi

    // Kategori Meeting -> false
    expect(isNearDeadline(targetDate, "Meeting", "Terjadwal", mockToday)).toBe(false);

    // Status Selesai -> false
    expect(isNearDeadline(targetDate, "Deadline", "Selesai", mockToday)).toBe(false);

    // Status Dibatalkan -> false
    expect(isNearDeadline(targetDate, "Deadline", "Dibatalkan", mockToday)).toBe(false);
    
    // Status Sedang Berlangsung -> true
    expect(isNearDeadline(targetDate, "Deadline", "Sedang Berlangsung", mockToday)).toBe(true);
  });
});
