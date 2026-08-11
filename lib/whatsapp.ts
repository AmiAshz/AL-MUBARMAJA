/**
 * Utility to open WhatsApp Web or Mobile Client with a pre-filled message and recipient
 */
export function openWhatsAppWeb(phone: string, message: string): void {
  // Strip all non-digit characters (e.g. +966 55 123 4567 -> 966551234567)
  const normalizedPhone = (phone || '').replace(/\D/g, '');

  if (!normalizedPhone) {
    console.error('WhatsApp Web opened: No valid phone number provided.');
    return;
  }

  // Detect mobile user agent to use the optimized WhatsApp deep-link
  const isMobile = typeof navigator !== 'undefined' && 
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  const baseUrl = isMobile 
    ? 'https://api.whatsapp.com/send' 
    : 'https://web.whatsapp.com/send';

  const url = `${baseUrl}?phone=${normalizedPhone}&text=${encodeURIComponent(message)}`;

  if (typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
