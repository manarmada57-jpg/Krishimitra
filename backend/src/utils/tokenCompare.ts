import crypto from "crypto";

/**
 * Compare two tokens securely using timingSafeEqual to prevent timing attacks.
 */
export function safeCompare(tokenA: string, tokenB: string): boolean {
  const bufA = Buffer.from(tokenA);
  const bufB = Buffer.from(tokenB);
  
  if (bufA.length !== bufB.length) {
    // Avoid short-circuiting to keep time consistent, though length difference already leaks
    // To be perfectly safe, we pad or perform timing safe comparison on same length buffer
    const dummyBuf = Buffer.from(tokenA);
    crypto.timingSafeEqual(bufA, dummyBuf);
    return false;
  }
  
  return crypto.timingSafeEqual(bufA, bufB);
}
