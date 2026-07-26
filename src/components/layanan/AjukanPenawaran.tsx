import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft, CheckCircle, Mail, Phone, Send, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ServiceOption {
  name: string;
  description: string | null;
  image_url: string | null;
  details: string[];
}

interface Scope {
  id: string;
  name: string;
}

interface ContactInfo {
  email: string;
  phone: string;
}

interface FormField {
  id: string;
  label: string;
  placeholder: string;
  type: "text" | "email" | "textarea";
  required: boolean;
  active: boolean;
  system: boolean;
  description: string;
}

const defaultFields: FormField[] = [
  { id: "nama_lengkap", label: "Nama Lengkap", placeholder: "Masukkan nama lengkap Anda", type: "text", required: true, active: true, system: true, description: "" },
  { id: "nama_perusahaan", label: "Nama Perusahaan / Instansi / Lembaga", placeholder: "Masukkan nama perusahaan / instansi / lembaga Anda", type: "text", required: true, active: true, system: true, description: "" },
  { id: "email", label: "Email", placeholder: "nama@perusahaan.com", type: "email", required: true, active: true, system: true, description: "" },
  { id: "whatsapp", label: "Nomor WhatsApp", placeholder: "+62 812-3456-7890", type: "text", required: true, active: true, system: true, description: "" },
  { id: "deskripsi", label: "Deskripsi Kebutuhan / Proyek", placeholder: "Jelaskan kebutuhan dan detail proyek Anda secara lengkap...", type: "textarea", required: true, active: true, system: true, description: "" },
  { id: "estimasi_waktu", label: "Estimasi Waktu Pengerjaan", placeholder: "Contoh: 3 bulan", type: "text", required: true, active: true, system: true, description: "" },
];

const AjukanPenawaran = () => {
  const { categorySlug, serviceType } = useParams();
  const { toast } = useToast();
  const [scope, setScope] = useState<Scope | null>(null);
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [contact, setContact] = useState<ContactInfo | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formTitle, setFormTitle] = useState("Ajukan Permintaan Penawaran");
  const [formDescription, setFormDescription] = useState("Isi formulir di bawah ini untuk mendapatkan penawaran terbaik dari kami.");
  const [proses, setProses] = useState<string[]>([]);
  const [keunggulan, setKeunggulan] = useState<{ label: string; desc: string }[]>([]);
  const [bantuanEmail, setBantuanEmail] = useState("");
  const [bantuanTelepon, setBantuanTelepon] = useState("");

  const [fields, setFields] = useState<FormField[]>(defaultFields);
  const [formValues, setFormValues] = useState<Record<string, string>>({
    nama_lengkap: "",
    nama_perusahaan: "",
    email: "",
    whatsapp: "",
    deskripsi: "",
    estimasi_waktu: "",
  });

  const handleInputChange = (fieldId: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [fieldId]: value }));
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch scope details
        const { data: scopeData, error: scopeErr } = await supabase
          .from("service_scopes")
          .select("id, name")
          .eq("slug", serviceType)
          .maybeSingle();

        if (scopeErr) throw scopeErr;

        // Fetch contact details
        const { data: contactData } = await supabase
          .from("kontak_info")
          .select("email, phone")
          .maybeSingle();

        if (contactData) {
          setContact(contactData);
        }

        if (scopeData) {
          setScope(scopeData);
          console.log("[Service Form] Scope ID:", scopeData.id);

          // Fetch items for this scope
          const { data: itemsData } = await supabase
            .from("service_scope_items")
            .select("name, description, image_url, details")
            .eq("scope_id", scopeData.id)
            .eq("is_active", true)
            .order("sort_order");

          if (itemsData) {
            const formatted = itemsData.map((item) => ({
              name: item.name,
              description: item.description,
              image_url: item.image_url,
              details: Array.isArray(item.details) ? (item.details as string[]) : [],
            }));
            setServices(formatted);
          }

          // Fetch CMS layout for form settings & custom fields
          const cmsSlug = "layanan-" + (categorySlug || "pemeliharaan");
          const { data: cmsData } = await supabase
            .from("cms_pages")
            .select("content")
            .eq("slug", cmsSlug)
            .maybeSingle();

          const content = cmsData?.content as any;
          const savedScope = content?.lingkup?.find((l: any) => l.id === scopeData.id)
            || content?.lingkup?.find((l: any) => l.nama?.toLowerCase() === scopeData.name?.toLowerCase());

          // LOGS
          console.log("[Category]", content?.card?.nama || "Layanan");
          console.log("[Category Slug]", categorySlug);
          console.log("[CMS Slug]", cmsSlug);
          console.log("[Scope UUID]", scopeData.id);
          console.log("[Scope Name]", scopeData.name);
          console.log("[CMS Fetch]", cmsData);
          console.log("[Matched Scope]", savedScope);

          if (savedScope?.form) {
            const formId = savedScope.form.id || `form-${scopeData.id.slice(0, 8)}`;
            const renderedFieldsList = savedScope.form.fields || defaultFields;
            const visibleFieldsList = renderedFieldsList.filter((f: any) => f.active);
            const requiredFieldsList = visibleFieldsList.filter((f: any) => f.required);

            console.log("[Form ID]", formId);
            console.log("[Matched Form]", savedScope.form);
            console.log("[Rendered Fields]", renderedFieldsList);
            console.log("[Database Fields]", savedScope.form.fields);
            console.log("[Visible Fields]", visibleFieldsList);
            console.log("[Required Fields]", requiredFieldsList);

            setFormTitle(savedScope.form.judul || "Ajukan Permintaan Penawaran");
            setFormDescription(savedScope.form.deskripsi || "");
            setProses((savedScope.form.proses || []).map((p: any) => p.teks));
            setKeunggulan((savedScope.form.keunggulan || []).map((k: any) => ({ label: k.judul, desc: k.deskripsi })));
            setBantuanEmail(savedScope.form.bantuanEmail || contactData?.email || "info@samastanusantara.com");
            setBantuanTelepon(savedScope.form.bantuanTelepon || contactData?.phone || "+62 812-3456-7890");
            setFields(renderedFieldsList);
          } else {
            console.log("[Form ID] Not found (Fallback)");
            console.log("[Matched Form] Not found (Fallback)");
            console.log("[Rendered Fields]", defaultFields);
            console.log("[Database Fields]", defaultFields);
            console.log("[Visible Fields]", defaultFields.filter(f => f.active));
            console.log("[Required Fields]", defaultFields.filter(f => f.required && f.active));

            // Fallbacks
            setFormTitle("Ajukan Permintaan Penawaran");
            setFormDescription("Isi formulir di bawah ini untuk mendapatkan penawaran terbaik dari kami. Tim profesional kami akan menghubungi Anda dalam waktu 1×24 jam untuk membahas kebutuhan proyek Anda secara detail.");
            setProses([
              "Tim kami akan menghubungi Anda dalam waktu 1×24 jam",
              "Diskusi kebutuhan dan spesifikasi proyek secara detail",
              "Kami akan menyusun proposal dan penawaran harga",
              "Mulai pengerjaan setelah kesepakatan tercapai",
            ]);
            setKeunggulan([
              { label: "Profesional", desc: "Tim ahli dengan pengalaman bertahun-tahun" },
              { label: "Responsif", desc: "Respon cepat dalam 1×24 jam" },
              { label: "Terpercaya", desc: "Dipercaya oleh ratusan perusahaan" },
            ]);
            setBantuanEmail(contactData?.email || "info@samastanusantara.com");
            setBantuanTelepon(contactData?.phone || "+62 812-3456-7890");
            setFields(defaultFields);
          }
        }
      } catch (err) {
        console.error("Error loading request form data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categorySlug, serviceType]);

  const toggleService = (name: string) => {
    setSelectedServices((prev) =>
      prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (selectedServices.length === 0) {
      toast({
        title: "Pilih layanan",
        description: "Pilih minimal satu layanan yang Anda butuhkan.",
        variant: "destructive",
      });
      return;
    }

    // Validate active required fields
    for (const f of fields) {
      if (f.active && f.required && !formValues[f.id]?.trim()) {
        toast({
          title: "Kolom Wajib Diisi",
          description: `Mohon isi kolom ${f.label} terlebih dahulu.`,
          variant: "destructive",
        });
        return;
      }
    }

    setSubmitting(true);
    try {
      // Separate system fields
      const nama_lengkap = (formValues.nama_lengkap || "").trim();
      const nama_perusahaan = (formValues.nama_perusahaan || "").trim();
      const email = (formValues.email || "").trim();
      const whatsapp = (formValues.whatsapp || "").trim();
      const deskripsi = (formValues.deskripsi || "").trim();
      const estimasi_waktu = (formValues.estimasi_waktu || "").trim();

      // Separate custom fields and serialize to JSON for notes
      const customFields = fields.filter(f => !f.system && f.active);
      const customValues = customFields.map(f => ({
        label: f.label,
        value: (formValues[f.id] || "").trim()
      }));

      const payload = {
        nama_lengkap: nama_lengkap || "-",
        nama_perusahaan: nama_perusahaan || "-",
        email: email || "-",
        whatsapp: whatsapp || "-",
        category_slug: categorySlug || "pemeliharaan",
        scope_slug: serviceType,
        selected_services: selectedServices,
        deskripsi: deskripsi || "-",
        estimasi_waktu: estimasi_waktu || "-",
        notes: customValues.length > 0 ? JSON.stringify(customValues) : null,
      };
      console.log("[Database Payload]", payload);

      const { error } = await supabase.from("pengajuan_penawaran").insert(payload);

      if (error) throw error;

      toast({
        title: "Permintaan terkirim!",
        description: "Tim kami akan menghubungi Anda dalam waktu 1×24 jam.",
      });

      // Reset values
      const resetValues: Record<string, string> = {};
      fields.forEach(f => {
        resetValues[f.id] = "";
      });
      setFormValues(resetValues);
      setSelectedServices([]);
    } catch (err: any) {
      toast({
        title: "Gagal mengirim permintaan",
        description: err?.message ?? "Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const visibleFields = (fields || []).filter((f) => f.active);
  const requiredFields = visibleFields.filter((f) => f.required);
  const hiddenFields = (fields || []).filter((f) => !f.active);
  console.log("[Service Form] Render Fields:", visibleFields);
  console.log("[Service Form] Hidden Fields:", hiddenFields);
  console.log("[Service Form] Visible Fields:", visibleFields);
  console.log("[Service Form] Required Fields:", requiredFields);

  const parentPath = `/layanan/${categorySlug || "pemeliharaan"}`;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1E3A8A]" />
      </div>
    );
  }

  if (!scope) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="py-32 text-center">
          <p className="text-muted-foreground">Halaman tidak ditemukan.</p>
          <Link to={parentPath} className="text-primary underline mt-4 inline-block">
            Kembali ke Layanan
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Back link */}
          <Link
            to={parentPath}
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline mb-8"
          >
            <ArrowLeft size={16} />
            Kembali
          </Link>

          {/* Header */}
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 bg-[#1E3A8A] text-white text-xs font-semibold rounded-full mb-4">
              {scope.name}
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-foreground mb-3">{formTitle}</h1>
            {formDescription && (
              <p className="text-muted-foreground text-sm max-w-lg mx-auto whitespace-pre-line">
                {formDescription}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                {(fields || []).filter(f => f.active).map((f) => {
                  const value = formValues[f.id] || "";

                  const renderFieldInput = () => {
                    const inputType = f.type || "text";

                    if (inputType === "textarea") {
                      return (
                        <Textarea
                          placeholder={f.placeholder}
                          rows={4}
                          required={f.required}
                          value={value}
                          onChange={(e) => handleInputChange(f.id, e.target.value)}
                        />
                      );
                    }

                    if (inputType === "select") {
                      const options = f.description ? f.description.split(",").map(o => o.trim()) : ["Opsi 1", "Opsi 2"];
                      return (
                        <select
                          required={f.required}
                          value={value}
                          onChange={(e) => handleInputChange(f.id, e.target.value)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">-- Pilih {f.label} --</option>
                          {options.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      );
                    }

                    if (inputType === "checkbox") {
                      return (
                        <div className="flex items-center space-x-2 py-1">
                          <Checkbox
                            id={f.id}
                            checked={value === "true" || value === "yes"}
                            onCheckedChange={(checked) => handleInputChange(f.id, checked ? "yes" : "no")}
                          />
                          <label htmlFor={f.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                            {f.placeholder || "Setuju / Pilih"}
                          </label>
                        </div>
                      );
                    }

                    if (inputType === "radio") {
                      const options = f.description ? f.description.split(",").map(o => o.trim()) : ["Ya", "Tidak"];
                      return (
                        <div className="flex flex-wrap gap-4 py-1">
                          {options.map(opt => (
                            <label key={opt} className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                              <input
                                type="radio"
                                name={f.id}
                                value={opt}
                                checked={value === opt}
                                onChange={(e) => handleInputChange(f.id, e.target.value)}
                                className="h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                              />
                              <span>{opt}</span>
                            </label>
                          ))}
                        </div>
                      );
                    }

                    return (
                      <Input
                        type={inputType}
                        placeholder={f.placeholder}
                        required={f.required}
                        value={value}
                        onChange={(e) => handleInputChange(f.id, e.target.value)}
                      />
                    );
                  };

                  return (
                    <div key={f.id} className="space-y-2">
                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">
                          {f.label} {f.required && <span className="text-red-500">*</span>}
                        </label>
                        {renderFieldInput()}
                        {f.description && (
                          <p className="text-xs text-muted-foreground mt-1 italic">{f.description}</p>
                        )}
                      </div>

                      {/* Render Service Selection directly after whatsapp field in the order */}
                      {f.id === "whatsapp" && services.length > 0 && (
                        <div className="pt-2">
                          <label className="block text-sm font-semibold text-foreground mb-2">
                            Layanan Kami <span className="text-red-500">*</span>
                            <span className="text-muted-foreground font-normal ml-1">(Dapat memilih lebih dari satu)</span>
                          </label>
                          <div className="space-y-4 mt-4">
                            {services.map((service) => (
                              <div
                                key={service.name}
                                className={`rounded-xl border-2 p-5 transition-colors cursor-pointer ${
                                  selectedServices.includes(service.name)
                                    ? "border-[#1E3A8A] bg-blue-50/50"
                                    : "border-border"
                                }`}
                                onClick={() => toggleService(service.name)}
                              >
                                <div className="flex flex-col md:flex-row gap-4">
                                  <div className="flex-1">
                                    <div className="flex items-start gap-3 mb-2">
                                      <Checkbox
                                        checked={selectedServices.includes(service.name)}
                                        onCheckedChange={() => toggleService(service.name)}
                                        onClick={(e) => e.stopPropagation()}
                                        className="mt-1"
                                      />
                                      <h4 className="font-bold text-foreground text-sm">{service.name}</h4>
                                    </div>
                                    <p className="text-muted-foreground text-xs leading-relaxed ml-7 mb-3">
                                      {service.description}
                                    </p>
                                    {service.details.length > 0 && (
                                      <div className="ml-7">
                                        <p className="text-xs font-semibold text-foreground mb-1">Ruang Lingkup:</p>
                                        <ul className="space-y-1">
                                          {service.details.map((d, i) => (
                                            <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                                              <span className="mt-0.5">•</span>
                                              <span>{d}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                  {service.image_url && (
                                    <div className="flex-shrink-0 w-full md:w-40 h-28 rounded-lg overflow-hidden bg-muted">
                                      <img src={service.image_url} alt={service.name} className="w-full h-full object-cover" />
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#1E3A8A] hover:bg-[#1D4ED8] text-white py-6 text-sm font-semibold"
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  {submitting ? "Mengirim..." : "Kirim Permintaan"}
                </Button>
              </form>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Proses Selanjutnya */}
              {proses.length > 0 && (
                <div className="bg-[#1E3A8A] rounded-xl p-6 text-white">
                  <h3 className="font-bold text-base mb-4">Proses Selanjutnya</h3>
                  <div className="space-y-4">
                    {proses.map((step, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                          {i + 1}
                        </div>
                        <p className="text-white/90 text-xs leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mengapa Memilih Kami */}
              {keunggulan.length > 0 && (
                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="font-bold text-base text-foreground mb-4">Mengapa Memilih Kami?</h3>
                  <div className="space-y-4">
                    {keunggulan.map((item) => (
                      <div key={item.label} className="flex items-start gap-3">
                        <CheckCircle size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-foreground">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Butuh Bantuan */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-bold text-base text-foreground mb-3">Butuh Bantuan?</h3>
                <p className="text-xs text-muted-foreground mb-4">Hubungi tim kami jika Anda memiliki pertanyaan</p>
                <div className="space-y-2">
                  {(bantuanEmail || contact?.email) && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Mail size={14} />
                      <span>{bantuanEmail || contact?.email}</span>
                    </div>
                  )}
                  {(bantuanTelepon || contact?.phone) && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Phone size={14} />
                      <span>{bantuanTelepon || contact?.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AjukanPenawaran;
