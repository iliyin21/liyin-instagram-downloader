/**
 * Validasi apakah string merupakan URL Instagram yang valid
 * Mendukung: post (/p/), reel (/reel/ atau /reels/), IGTV (/tv/)
 */
function isValidInstagramUrl(url) {
  if (!url || typeof url !== "string") return false;

  const pattern =
    /^https?:\/\/(www\.)?instagram\.com\/(p|reel|reels|tv)\/([A-Za-z0-9_-]+)\/?/i;

  return pattern.test(url.trim());
}

/**
 * Membersihkan URL dari query string yang tidak perlu (mis. ?igsh=...)
 */
function sanitizeUrl(url) {
  try {
    const parsed = new URL(url.trim());
    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    return url;
  }
}

module.exports = { isValidInstagramUrl, sanitizeUrl };
