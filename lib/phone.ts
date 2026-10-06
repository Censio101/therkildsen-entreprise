const MAX_PHONE_DIGITS = 10;

export function phoneDigitsOnly(value: string) {
  return value.replace(/\D/g, "").slice(0, MAX_PHONE_DIGITS);
}

/** Valid: 8 local digits, or 10 digits with leading 45 (e.g. 4528778277). */
export function isValidDanishPhone(value: string) {
  const digits = phoneDigitsOnly(value);
  if (digits.length === 8) return true;
  if (digits.length === 10 && digits.startsWith("45")) return true;
  return false;
}

export function formatPhoneInput(value: string) {
  const digits = phoneDigitsOnly(value);
  if (digits.length === 0) return "";

  if (digits.startsWith("45")) {
    const local = digits.slice(2, 10);
    const grouped = local.match(/.{1,2}/g)?.join(" ") ?? local;
    return local.length ? `45 ${grouped}`.trim() : "45";
  }

  return digits.match(/.{1,2}/g)?.join(" ") ?? digits;
}

export function formatPhoneDisplay(value?: string) {
  const digits = phoneDigitsOnly(value ?? "");
  if (digits.length === 10 && digits.startsWith("45")) {
    const local = digits.slice(2);
    return `45 ${local.match(/.{1,2}/g)?.join(" ") ?? local}`;
  }
  if (digits.length >= 8) {
    const local = digits.slice(0, 8);
    return local.match(/.{1,2}/g)?.join(" ") ?? local;
  }
  return digits.match(/.{1,2}/g)?.join(" ") ?? digits;
}
