"use client";

import { useEffect, useState } from "react";
import { captureAttributionFromWindow, getStoredAttribution } from "@/lib/attribution";
import { trackLead } from "@/lib/meta-pixel";
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  Check,
  CheckCircle2,
  ChevronLeft,
  Home as HomeIcon,
  Mail,
  Phone,
  Ruler,
  ShieldCheck,
  Wrench,
} from "lucide-react";

const logoSrc = "/therkildsen-logo-transparent_c295708b.png";
const vanSrc = "/provided-project-2_d35afd48.jpg";
const successPortraitSrc = "/mejner-success-portrait-centered_41e94530.jpg";
const heroSrc = "/therkildsen-roof-hero-upscaled_97a89010.png";
const galleryImages = [
  "/mejner2_51c55978.jpg",
  "/mejner4_ed1ca536.jpg",
  "/mejner5_ec3cd03b.jpg",
  heroSrc,
];

const projectServices = [
  { label: "Tagpap", description: "En ny, holdbar tagløsning.", icon: HomeIcon },
  { label: "Tagrenovering", description: "Forlæng tagets levetid.", icon: Wrench },
  { label: "Andet", description: "Fortæl os, hvad du har brug for.", icon: Ruler },
];

type CustomerType = "Privat" | "Erhverv" | "";

type FormState = {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  postcode: string;
  customerType: CustomerType;
  company: string;
  services: string[];
  comment: string;
};

const emptyForm: FormState = {
  name: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  postcode: "",
  customerType: "",
  company: "",
  services: [],
  comment: "",
};

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  return digits.match(/.{1,2}/g)?.join(" ") ?? "";
}

function formatLetters(value: string) {
  return value.replace(/[^A-Za-zÆØÅæøåÉéÜü\s.'-]/g, "");
}

export default function LandingPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [invalidFields, setInvalidFields] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    captureAttributionFromWindow();
  }, []);

  const updateField = (field: keyof FormState, value: string | string[]) => {
    setForm((current) => ({ ...current, [field]: value }));
    setInvalidFields((current) => current.filter((item) => item !== field));
  };

  const validateStep = () => {
    const invalid: string[] = [];
    const phoneDigits = form.phone.replace(/\D/g, "");

    if (step === 1) {
      if (!form.name.trim() || /\d/.test(form.name)) invalid.push("name");
      if (phoneDigits.length !== 8) invalid.push("phone");
      if (!/^\S+@\S+\.\S+$/.test(form.email)) invalid.push("email");
    }

    if (step === 2) {
      if (!form.address.trim()) invalid.push("address");
      if (!form.city.trim() || /\d/.test(form.city)) invalid.push("city");
      if (!/^\d{4}$/.test(form.postcode)) invalid.push("postcode");
    }

    if (step === 3) {
      if (!form.customerType) invalid.push("customerType");
      if (form.customerType === "Erhverv" && !form.company.trim()) invalid.push("company");
    }

    if (step === 4 && form.services.length === 0) invalid.push("services");

    setInvalidFields(invalid);
    return invalid.length === 0;
  };

  const next = async () => {
    if (!validateStep() || isSubmitting) return;
    if (step < 4) {
      setSubmitError(null);
      setStep((current) => current + 1);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          email: form.email,
          address: form.address,
          city: form.city,
          postcode: form.postcode,
          customerType: form.customerType,
          company: form.company,
          service: form.services[0] ?? "",
          comment: form.comment,
          attribution: getStoredAttribution(),
        }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        setSubmitError(json.error ?? "Kunne ikke sende henvendelsen. Prøv igen om lidt.");
        return;
      }
      await trackLead({
        name: form.name,
        email: form.email,
        phone: form.phone,
        city: form.city,
        postcode: form.postcode,
        customerType: form.customerType,
        service: form.services[0] ?? "",
      });
      setSubmitted(true);
      window.setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 0);
    } catch {
      setSubmitError("Kunne ikke sende henvendelsen. Prøv igen om lidt.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleService = (service: string) => {
    updateField("services", form.services.includes(service) ? [] : [service]);
  };

  const restart = () => {
    setSubmitted(false);
    setStep(1);
    setForm(emptyForm);
    setInvalidFields([]);
    window.setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 0);
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#10130f] text-white">
      <main>
        <section className={`template-hero relative isolate min-h-screen overflow-hidden ${submitted ? "success-hero" : ""}`}>
          <img src={heroSrc} alt="Tagarbejde udført af Therkildsen Entreprise" className="hero-background absolute inset-0 -z-30 h-full w-full object-cover" />
          <div className="hero-green-tint absolute inset-0 -z-20" />
          <div className="hero-contrast absolute inset-0 -z-10" />
          <div className="hero-grain absolute inset-0 -z-10" />
          <div className="hero-top-shade absolute inset-x-0 top-0 -z-10" />

          <header className={`hero-header ${submitted ? "hero-header-success" : ""}`}>
            <a href="#top" aria-label="Therkildsen Entreprise forside" className="brand-lockup">
              <img src={logoSrc} alt="Therkildsen Entreprise" className="brand-logo-image" />
            </a>
          </header>

          <div
            id="top"
            className={
              submitted
                ? "success-stage"
                : "hero-stage"
            }
          >
            {submitted ? (
              <SuccessView onRestart={restart} />
            ) : (
              <>
                <div className="personal-card">
                  <div className="personal-avatar-block">
                    <span className="personal-portrait">
                      <img src={vanSrc} alt="Mejner Therkildsen" className="h-full w-full object-cover [object-position:6%_28%]" />
                    </span>
                    <p className="person-role">
                      <strong>Mejner Therkildsen</strong>
                      Ejer
                    </p>
                  </div>
                  <div className="personal-headline">
                    <h1>
                      Få en professionel og <em>uforpligtende vurdering</em> af dit byggeprojekt
                    </h1>
                  </div>
                </div>

                <form
                  id="lead-form"
                  className="lead-card"
                  onSubmit={(event) => {
                    event.preventDefault();
                    next();
                  }}
                  noValidate
                >
                  {step === 1 && <ContactStep form={form} updateField={updateField} invalidFields={invalidFields} />}
                  {step === 2 && <AddressStep form={form} updateField={updateField} invalidFields={invalidFields} />}
                  {step === 3 && (
                    <CustomerStep
                      form={form}
                      updateField={updateField}
                      invalidFields={invalidFields}
                      onPrivat={() => setStep(4)}
                    />
                  )}
                  {step === 4 && (
                    <ProjectStep
                      form={form}
                      updateField={updateField}
                      toggleService={toggleService}
                      invalidFields={invalidFields}
                    />
                  )}

                  <div className={`form-actions ${step > 1 ? "has-back" : ""}`}>
                    {step > 1 && (
                      <button
                        type="button"
                        className="back-button"
                        onClick={() => {
                          setStep((current) => current - 1);
                          setInvalidFields([]);
                        }}
                      >
                        <ChevronLeft className="h-5 w-5" />
                        Tilbage
                      </button>
                    )}
                    <button type="submit" className="primary-cta" disabled={isSubmitting}>
                      {step === 4 ? (
                        <span>Send forespørgsel</span>
                      ) : (
                        <>
                          <span className="sm:hidden">Få et uforpligtende tilbud</span>
                          <span className="hidden sm:inline">Få en professionel og uforpligtende vurdering</span>
                        </>
                      )}
                      <ArrowRight className="h-4 w-4 shrink-0" />
                    </button>
                  </div>
                  <p className={`privacy-note ${step > 1 ? "privacy-note-with-back" : ""}`}>
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Dine oplysninger behandles fortroligt.
                  </p>
                  {submitError && <p className="submit-error">{submitError}</p>}
                </form>

                <div className="trust-points">
                  <span>
                    <Check className="h-5 w-5" />
                    Personlig rådgivning
                  </span>
                  <span>
                    <Check className="h-5 w-5" />
                    Ingen binding
                  </span>
                  <span>
                    <Check className="h-5 w-5" />
                    Små og store projekter
                  </span>
                </div>
              </>
            )}
          </div>
        </section>

        {!submitted && (
          <section className="gallery-section">
            <div className="gallery-track">
              {[...galleryImages, ...galleryImages].map((image, index) => (
                <figure className="gallery-image" key={`${image}-${index}`}>
                  <img src={image} alt="Projekt udført af Therkildsen Entreprise" className={`gallery-crop-${index % 6}`} />
                </figure>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="bg-[#0a0d0a] px-5 py-8 text-white/55 sm:px-8">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-5 text-[11px] font-semibold uppercase tracking-[.11em] sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-white">Therkildsen Entreprise</p>
            <p className="mt-1">Billund & Trekantområdet</p>
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            <a href="tel:+4528778277" className="transition hover:text-[#caec6d]">
              28 77 82 77
            </a>
            <a href="http://therkildsen-ent.dk/" target="_blank" rel="noreferrer" className="transition hover:text-[#caec6d]">
              therkildsen-ent.dk <ArrowUpRight className="ml-1 inline h-3 w-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

type StepProps = {
  form: FormState;
  updateField: (field: keyof FormState, value: string | string[]) => void;
  invalidFields: string[];
};

function ContactStep({ form, updateField, invalidFields }: StepProps) {
  return (
    <fieldset>
      <div className="grid gap-5">
        <Field
          label="Fulde navn"
          value={form.name}
          onChange={(value) => updateField("name", formatLetters(value))}
          placeholder="Fx Anna Jensen"
          invalid={invalidFields.includes("name")}
          autoComplete="name"
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Telefonnummer"
            value={form.phone}
            onChange={(value) => updateField("phone", formatPhone(value))}
            placeholder="Fx 41 15 23 77"
            invalid={invalidFields.includes("phone")}
            type="tel"
            autoComplete="tel"
            inputMode="numeric"
          />
          <Field
            label="E-mail"
            value={form.email}
            onChange={(value) => updateField("email", value)}
            placeholder="Fx anna@email.dk"
            invalid={invalidFields.includes("email")}
            type="email"
            autoComplete="email"
          />
        </div>
      </div>
    </fieldset>
  );
}

function AddressStep({ form, updateField, invalidFields }: StepProps) {
  return (
    <fieldset>
      <div className="grid gap-5">
        <Field
          label="Adresse"
          value={form.address}
          onChange={(value) => updateField("address", value)}
          placeholder="Fx Hovedgaden 12"
          invalid={invalidFields.includes("address")}
          autoComplete="street-address"
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="By"
            value={form.city}
            onChange={(value) => updateField("city", formatLetters(value))}
            placeholder="Fx Billund"
            invalid={invalidFields.includes("city")}
            autoComplete="address-level2"
          />
          <Field
            label="Postnummer"
            value={form.postcode}
            onChange={(value) => updateField("postcode", value.replace(/\D/g, "").slice(0, 4))}
            placeholder="Fx 7190"
            invalid={invalidFields.includes("postcode")}
            inputMode="numeric"
            autoComplete="postal-code"
          />
        </div>
      </div>
    </fieldset>
  );
}

function CustomerStep({ form, updateField, invalidFields, onPrivat }: StepProps & { onPrivat: () => void }) {
  return (
    <fieldset>
      <div className={`grid grid-cols-2 gap-3 sm:gap-4 ${invalidFields.includes("customerType") ? "invalid-group" : ""}`}>
        {(["Privat", "Erhverv"] as const).map((type) => {
          const Icon = type === "Privat" ? HomeIcon : Building2;
          return (
            <button
              type="button"
              key={type}
              className={`person-type ${form.customerType === type ? "selected" : ""}`}
              onClick={() => {
                updateField("customerType", type);
                if (type === "Privat") onPrivat();
              }}
            >
              <Icon className="h-6 w-6" />
              <span>{type}</span>
              {form.customerType === type && <CheckCircle2 className="selected-check h-5 w-5" />}
            </button>
          );
        })}
      </div>
      {form.customerType === "Erhverv" && (
        <div className="mt-5">
          <Field
            label="Virksomhedsnavn"
            value={form.company}
            onChange={(value) => updateField("company", value)}
            placeholder="Fx Virksomhed ApS"
            invalid={invalidFields.includes("company")}
            autoComplete="organization"
          />
        </div>
      )}
    </fieldset>
  );
}

function ProjectStep({
  form,
  updateField,
  toggleService,
  invalidFields,
}: StepProps & { toggleService: (service: string) => void }) {
  return (
    <fieldset>
      <div className="project-step-header">
        <h2>Hvad kan jeg hjælpe med?</h2>
        <p>Vælg den løsning, der passer bedst til dit projekt.</p>
      </div>
      <div className={`project-services ${invalidFields.includes("services") ? "invalid-group" : ""}`}>
        {projectServices.map(({ label, description, icon: Icon }) => {
          const selected = form.services.includes(label);
          return (
            <button
              type="button"
              key={label}
              className={`project-service-option ${selected ? "selected" : ""}`}
              onClick={() => toggleService(label)}
            >
              <span className="project-service-icon">
                <Icon />
              </span>
              <span className="project-service-copy">
                <strong>{label}</strong>
                <small>{description}</small>
              </span>
              <span className="project-radio">{selected && <Check className="h-4 w-4" />}</span>
            </button>
          );
        })}
      </div>
      <label className="comment-field">
        <span>
          Kommentar <small>(valgfri)</small>
        </span>
        <textarea
          className="form-textarea"
          value={form.comment}
          onChange={(event) => updateField("comment", event.target.value)}
          placeholder="Skriv gerne lidt om dit projekt, ønsker eller spørgsmål..."
          rows={4}
        />
      </label>
    </fieldset>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  invalid,
  type = "text",
  autoComplete,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  invalid: boolean;
  type?: string;
  autoComplete?: string;
  inputMode?: "text" | "numeric" | "tel" | "email";
}) {
  return (
    <label className="field-label">
      {label}
      <input
        className={`form-input ${invalid ? "invalid" : ""}`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type={type}
        autoComplete={autoComplete}
        inputMode={inputMode}
        aria-invalid={invalid}
      />
    </label>
  );
}

function SuccessView({ onRestart }: { onRestart: () => void }) {
  return (
    <div className="success-wrap">
      <div className="success-card">
        <span className="success-portrait">
          <img src={successPortraitSrc} alt="Mejner Therkildsen" className="h-full w-full object-cover" />
        </span>
        <h1>
          Tak for din
          <br />
          <em>forespørgsel!</em>
        </h1>
        <p className="success-copy">Vi har modtaget dine oplysninger.</p>
        <div className="success-contact">
          <p>Du bliver kontaktet hurtigst muligt. Hvis det haster, er du velkommen til at ringe eller sende en mail.</p>
          <div className="success-contact-actions">
            <a href="tel:+4528778277">
              <Phone />
              28 77 82 77
            </a>
            <a href="mailto:kontakt@therkildsen-ent.dk">
              <Mail />
              kontakt@therkildsen-ent.dk
            </a>
          </div>
        </div>
        <a href="http://therkildsen-ent.dk/" target="_blank" rel="noreferrer" className="primary-cta">
          <span>Besøg vores hjemmeside</span>
          <ArrowUpRight className="h-4 w-4" />
        </a>
        <button type="button" className="restart-button" onClick={onRestart}>
          Lav en ny forespørgsel
        </button>
      </div>
    </div>
  );
}
