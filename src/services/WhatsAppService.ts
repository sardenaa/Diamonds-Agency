export interface WhatsAppMessage {
  id?: string;
  sender: 'system' | 'customer' | 'support';
  message: string;
  timestamp: string;
}

export class WhatsAppService {
  /**
   * Automates transactional booking confirmation messages, leveraging reservation data
   * to trigger professional templates for guests.
   */
  static async sendBookingConfirmation(booking: any): Promise<{ success: boolean; message?: string }> {
    try {
      const res = await fetch('/api/whatsapp/send-template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bookingId: booking.id,
          // Use the default confirmed template
          templateId: 'tpl-1'
        })
      });

      if (res.ok) {
        const data = await res.json();
        return { success: true, message: data.message };
      }
      const errData = await res.json();
      return { success: false, message: errData.error || 'Failed to dispatch confirmation.' };
    } catch (err: any) {
      console.error('WhatsApp Confirmation dispatch error:', err);
      return { success: false, message: err.message };
    }
  }

  /**
   * Dispatches a custom WhatsApp message manually for CRM guests.
   */
  static async sendManualMessage(email: string, message: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/crm/${encodeURIComponent(email)}/whatsapp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message })
      });
      return res.ok;
    } catch (err) {
      console.error('Failed to send manual WhatsApp message:', err);
      return false;
    }
  }
}
