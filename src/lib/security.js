/**
 * Security & Sanitization Utilities for Nexora Platform
 * Enforces strict boundary checks, input validation, and XSS prevention
 */

const SAFE_URL_PROTOCOLS = new Set(["http:", "https:"]);

/**
 * Validates and sanitizes external URLs to prevent XSS (e.g. javascript: or data: exploits)
 * @param {string} rawUrl 
 * @returns {string|null} Safe URL or null if invalid/dangerous
 */
export function sanitizeUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== "string") return null;
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;

  try {
    // If user provided a URL without protocol like 'github.com/user', prepend https://
    const urlString = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const parsed = new URL(urlString);

    if (!SAFE_URL_PROTOCOLS.has(parsed.protocol)) {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

/**
 * Validates email with standard RFC 5322 compliant pattern
 * @param {string} email 
 * @returns {boolean}
 */
export function isValidEmail(email) {
  if (!email || typeof email !== "string") return false;
  const trimmed = email.trim();
  if (trimmed.length > 254) return false;
  // RFC compliant regex checking local-part and domain-part
  return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/.test(
    trimmed
  );
}

/**
 * Sanitizes and caps text length to prevent memory abuse or buffer flooding
 * @param {string} text 
 * @param {number} maxLength 
 * @returns {string}
 */
export function sanitizeText(text, maxLength = 2000) {
  if (typeof text !== "string") return "";
  // Remove dangerous control characters (keep newlines and tabs)
  const cleaned = text.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
  return cleaned.trim().slice(0, maxLength);
}

/**
 * Validates password strength
 * @param {string} password 
 * @returns {{ valid: boolean, message?: string }}
 */
export function validatePasswordStrength(password) {
  if (!password || typeof password !== "string") {
    return { valid: false, message: "Password is required." };
  }
  if (password.length < 6) {
    return { valid: false, message: "Password must be at least 6 characters." };
  }
  if (password.length > 128) {
    return { valid: false, message: "Password is too long (max 128 characters)." };
  }
  return { valid: true };
}
