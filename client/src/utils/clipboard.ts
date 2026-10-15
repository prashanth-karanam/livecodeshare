import copy from 'copy-to-clipboard';

/**
 * Universal clipboard copy function that works reliably across:
 * - HTTPS origins (trycloudflare.com, github.io, vercel.app)
 * - Insecure HTTP origins (10.x.x.x local network, mobile IP)
 * - Mobile Safari (iOS) & Chrome (Android)
 * - Tablets, desktops, and embedded WebViews
 * - With fallback to window.prompt if programmatic clipboard is strictly blocked
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (!text) return false;

  try {
    const success = await copy(text, {
      fallbackToPrompt: true,
      message: 'Press #{key} to copy room link:',
      debug: false,
    });
    if (success) return true;
  } catch (err) {
    console.warn('copy-to-clipboard primary attempt error:', err);
  }

  // Direct DOM textarea fallback
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = '0';
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    textArea.setSelectionRange(0, text.length);
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    if (successful) return true;
  } catch (err) {
    console.warn('execCommand direct fallback error:', err);
  }

  // Last-resort fallback: prompt user with pre-selected text to copy
  try {
    if (typeof window !== 'undefined') {
      window.prompt('Copy this link (Ctrl+C / Cmd+C / tap Copy):', text);
      return true;
    }
  } catch (e) {
    console.error('All clipboard methods failed:', e);
  }

  return false;
}
