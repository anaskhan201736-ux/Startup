/**
 * WhatsApp integration helpers
 * Allows direct peer-to-peer chats via wa.me without exposing raw phone numbers in the public UI.
 */

/**
 * Strips formatting (spaces, hyphens, brackets, leading +) to get pure digits.
 */
export function sanitizeWhatsAppNumber(input: string): string {
  if (!input) return '';
  let digits = input.replace(/[^\d+]/g, '');
  if (digits.startsWith('+')) {
    digits = digits.slice(1);
  }
  return digits;
}

/**
 * Builds direct WhatsApp chat link (wa.me) with pre-filled message
 * Includes book name, class, and subject so the donor immediately knows which book is being inquired about.
 */
export function getWhatsAppChatUrl(
  phone: string,
  bookTitle: string,
  bookClass?: string,
  bookSubject?: string
): string {
  const cleanPhone = sanitizeWhatsAppNumber(phone);
  let message = `Hello! I saw your textbook listing "${bookTitle}"`;
  if (bookClass || bookSubject) {
    const details = [bookClass, bookSubject].filter(Boolean).join(' · ');
    message += ` (${details})`;
  }
  message += ` on BookCycle. Is it still available?`;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
