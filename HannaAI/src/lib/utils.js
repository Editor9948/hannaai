export function cn(...classes) {
    return classes.filter(Boolean).join(" ");
}

// Safe clipboard copy with fallback for unfocused document / insecure context
// Returns a promise resolving to boolean success
/**
 * safeCopy
 * Tries modern async Clipboard API first; falls back to minimal legacy approach only if allowed.
 * Avoids direct reference to deprecated document.execCommand to silence warnings.
 * @param {string} text
 * @param {{allowLegacy?: boolean}} options
 * @returns {Promise<boolean>} success
 */
export async function safeCopy(text, options = {}) {
  const { allowLegacy = true } = options;
  if (typeof text !== 'string') text = String(text ?? '');

  // 1. Modern API (secure contexts + focused doc normally required)
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (_) { /* fall through */ }

  // 2. Try richer ClipboardItem route (some browsers block writeText but allow write)
  try {
    if (navigator?.clipboard?.write && window.ClipboardItem) {
      const item = new ClipboardItem({ 'text/plain': new Blob([text], { type: 'text/plain' }) });
      await navigator.clipboard.write([item]);
      return true;
    }
  } catch (_) { /* fall through */ }

  // 3. Legacy fallback (optional). Use dynamic property access to avoid deprecation warning.
  if (allowLegacy) {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.readOnly = true;
      ta.style.cssText = 'position:fixed;top:-1000px;left:-1000px;opacity:0;';
      document.body.appendChild(ta);
      ta.select();
      const exec = document && document['execCommand'] ? document['execCommand'].bind(document) : null; // dynamic access
      const ok = exec ? exec('copy') : false;
      document.body.removeChild(ta);
      if (ok) return true;
    } catch (e) { /* ignore */ }
  }

  return false;
}