/**
 * Validation utilities for Terre Spa customer inputs
 */

/**
 * Validates a Vietnamese phone number.
 * Accepts formats like:
 * - 0912345678, 0912 345 678, 091-234-5678, 0912.345.678
 * - +84912345678, 84912345678
 * - Landlines: 02431234567, 02831234567
 */
export function isValidVietnamesePhone(phone: string): boolean {
  if (!phone || typeof phone !== "string") return false;
  
  // Strip spaces, dots, dashes, parentheses
  const cleaned = phone.replace(/[\s.\-()]/g, "");
  
  // Reject obviously fake repetitive numbers
  if (/^0{10}$/.test(cleaned) || /^1{10}$/.test(cleaned)) return false;

  // Standard Vietnam mobile prefixes: 03, 05, 07, 08, 09 (10 digits)
  // Or +84 / 84 equivalent
  // Or landlines 024, 028 (10-11 digits)
  const vnPhoneRegex = /^(?:(?:\+?84)|0)(?:3[2-9]|5[25689]|7[06-9]|8[1-9]|9[0-9]|2[48][0-9])[0-9]{7}$/;
  
  return vnPhoneRegex.test(cleaned);
}

/**
 * Formats a raw phone string into standard display (e.g. 0912 345 678)
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("84") && cleaned.length >= 10) {
    const local = "0" + cleaned.slice(2);
    if (local.length === 10) {
      return `${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7)}`;
    }
    return local;
  }
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  return phone;
}

/**
 * Validates customer name: at least 2 characters, no purely numbers/symbols
 */
export function isValidCustomerName(name: string): boolean {
  if (!name || typeof name !== "string") return false;
  const trimmed = name.trim();
  if (trimmed.length < 2 || trimmed.length > 60) return false;
  // Must contain at least one letter (Vietnamese or Latin)
  return /[a-zA-ZÀ-ỹ]/.test(trimmed);
}

/**
 * Validates optional email address
 */
export function isValidEmail(email: string): boolean {
  if (!email) return true; // Optional
  const trimmed = email.trim();
  if (!trimmed) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}
