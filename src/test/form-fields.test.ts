import { describe, it, expect } from "vitest";
import { createDefaultFields } from "@/components/admin/layanan/LayananSubPage";

// Helper function logic replicated from PengajuanJasaPage.tsx for unit testing
const parseCustomFields = (notes: string | null | undefined): { label: string; value: string }[] => {
  if (!notes) return [];
  try {
    const parsed = JSON.parse(notes);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (e) {}
  return [];
};

describe("Form Fields & Settings Integration", () => {
  it("should return the correct system fields with their default configurations", () => {
    const defaultFields = createDefaultFields();
    expect(defaultFields).toHaveLength(6);

    const fieldIds = defaultFields.map(f => f.id);
    expect(fieldIds).toContain("nama_lengkap");
    expect(fieldIds).toContain("nama_perusahaan");
    expect(fieldIds).toContain("email");
    expect(fieldIds).toContain("whatsapp");
    expect(fieldIds).toContain("deskripsi");
    expect(fieldIds).toContain("estimasi_waktu");

    // All system fields must have system flag set to true
    defaultFields.forEach(f => {
      expect(f.system).toBe(true);
      expect(f.active).toBe(true);
      expect(f.required).toBe(true);
    });

    // Check specific system field types
    const emailField = defaultFields.find(f => f.id === "email");
    expect(emailField?.type).toBe("email");

    const descField = defaultFields.find(f => f.id === "deskripsi");
    expect(descField?.type).toBe("textarea");
  });

  it("should parse valid JSON custom fields from notes column successfully", () => {
    const validJsonNotes = JSON.stringify([
      { label: "Lokasi Proyek", value: "Bandung" },
      { label: "Jumlah Personel", value: "25" }
    ]);

    const parsed = parseCustomFields(validJsonNotes);
    expect(parsed).toHaveLength(2);
    expect(parsed[0].label).toBe("Lokasi Proyek");
    expect(parsed[0].value).toBe("Bandung");
    expect(parsed[1].label).toBe("Jumlah Personel");
    expect(parsed[1].value).toBe("25");
  });

  it("should return an empty array if notes is empty, null, or invalid JSON", () => {
    expect(parseCustomFields(null)).toEqual([]);
    expect(parseCustomFields(undefined)).toEqual([]);
    expect(parseCustomFields("")).toEqual([]);
    expect(parseCustomFields("plain text note that is not JSON")).toEqual([]);
    expect(parseCustomFields("{invalid json")).toEqual([]);
  });
});
