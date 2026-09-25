/**
 * Utility to safely open documents, PDFs, base64 data URLs, and external links in a new tab.
 * Resolves the issue where modern browsers block window.open on 'data:' URIs (resulting in 'about:blank').
 */
export const openDocumentInNewTab = (urlOrData) => {
  if (!urlOrData || typeof urlOrData !== 'string') return;

  const trimmed = urlOrData.trim();

  // If it's a base64 Data URL (e.g. uploaded PDF or document)
  if (trimmed.startsWith('data:')) {
    try {
      const commaIdx = trimmed.indexOf(',');
      if (commaIdx !== -1) {
        const header = trimmed.substring(0, commaIdx);
        const base64Data = trimmed.substring(commaIdx + 1);

        const mimeMatch = header.match(/data:([^;]+)/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'application/pdf';

        const binaryString = atob(base64Data);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        const blob = new Blob([bytes], { type: mimeType });
        const blobUrl = URL.createObjectURL(blob);

        const newWin = window.open(blobUrl, '_blank', 'noopener,noreferrer');
        if (!newWin) {
          // Popup blocked fallback
          const link = document.createElement('a');
          link.href = blobUrl;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }

        // Clean up object URL after 2 minutes to free browser memory
        setTimeout(() => {
          try {
            URL.revokeObjectURL(blobUrl);
          } catch {}
        }, 120000);
        return;
      }
    } catch (err) {
      console.error('Error opening base64 data URL as blob in new tab:', err);
    }
  }

  // If it's a standard web link or relative path
  let finalUrl = trimmed;
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://') && !trimmed.startsWith('/') && !trimmed.startsWith('blob:')) {
    finalUrl = 'https://' + trimmed;
  }

  window.open(finalUrl, '_blank', 'noopener,noreferrer');
};
