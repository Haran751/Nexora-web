/**
 * In-memory security store for Rate Limiting & OTP Verification
 * Prevents brute-force attacks, spamming, and unauthorized password resets
 */

// Key -> { count: number, resetAt: number }
const rateLimitMap = new Map();

// Email -> { code: string, expiresAt: number, attempts: number, verified: boolean }
const recoveryStore = new Map();

// Clean expired records every 5 minutes to prevent memory leak
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, val] of rateLimitMap.entries()) {
      if (now > val.resetAt) rateLimitMap.delete(key);
    }
    for (const [email, val] of recoveryStore.entries()) {
      if (now > val.expiresAt) recoveryStore.delete(email);
    }
  }, 5 * 60 * 1000).unref?.();
}

/**
 * Checks rate limit for an identifier (IP, email, or endpoint+IP)
 * @param {string} identifier 
 * @param {number} maxRequests 
 * @param {number} windowMs 
 * @returns {boolean} True if allowed, False if limit exceeded
 */
export function checkRateLimit(identifier, maxRequests = 5, windowMs = 10 * 60 * 1000) {
  if (!identifier) return true;
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(identifier, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count += 1;
  return true;
}

/**
 * Stores a recovery OTP code for an email with 10-minute expiry
 * @param {string} email 
 * @param {string} code 
 */
export function storeRecoveryOtp(email, code) {
  if (!email || !code) return;
  const cleanEmail = email.toLowerCase().trim();
  recoveryStore.set(cleanEmail, {
    code: String(code).trim(),
    expiresAt: Date.now() + 10 * 60 * 1000,
    attempts: 0,
    verified: false,
  });
}

/**
 * Verifies recovery OTP code with maximum 5 attempts and timing-safe check
 * @param {string} email 
 * @param {string} code 
 * @returns {boolean}
 */
export function verifyRecoveryOtp(email, code) {
  if (!email || !code) return false;
  const cleanEmail = email.toLowerCase().trim();
  const record = recoveryStore.get(cleanEmail);

  if (!record) return false;

  if (Date.now() > record.expiresAt) {
    recoveryStore.delete(cleanEmail);
    return false;
  }

  record.attempts += 1;
  if (record.attempts > 5) {
    recoveryStore.delete(cleanEmail);
    return false;
  }

  const expected = record.code;
  const actual = String(code).trim();

  // Basic constant length check
  let match = expected.length === actual.length;
  for (let i = 0; i < expected.length && i < actual.length; i++) {
    if (expected[i] !== actual[i]) match = false;
  }

  if (match) {
    record.verified = true;
    return true;
  }
  return false;
}

/**
 * Checks if the email is authorized to reset password (OTP was verified) and consumes it
 * @param {string} email 
 * @param {string} [code] optional code if verified directly at reset step
 * @returns {boolean}
 */
export function consumeResetAuthorization(email, code) {
  if (!email) return false;
  const cleanEmail = email.toLowerCase().trim();
  const record = recoveryStore.get(cleanEmail);

  if (!record) return false;

  if (Date.now() > record.expiresAt) {
    recoveryStore.delete(cleanEmail);
    return false;
  }

  const isCodeMatch = code && String(code).trim() === record.code;
  if (record.verified || isCodeMatch) {
    recoveryStore.delete(cleanEmail); // Single-use consumption
    return true;
  }

  return false;
}
