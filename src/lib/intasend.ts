const IntaSend = require('intasend-node');

const INTASEND_PUBLISHABLE_KEY = process.env.INTASEND_PUBLISHABLE_KEY;
const INTASEND_SECRET_KEY = process.env.INTASEND_SECRET_KEY;
const INTASEND_IS_TEST = process.env.INTASEND_IS_TEST === 'true';

if (!INTASEND_PUBLISHABLE_KEY || !INTASEND_SECRET_KEY) {
  console.warn('⚠️ IntaSend credentials missing. Payment functionality will be limited.');
}

// Initialize IntaSend client
const intasend = new IntaSend(
  INTASEND_PUBLISHABLE_KEY,
  INTASEND_SECRET_KEY,
  INTASEND_IS_TEST // Test mode
);

export interface ChargePayload {
  first_name: string;
  last_name: string;
  email: string;
  host: string;
  amount: number;
  currency?: string;
  api_ref: string;
  redirect_url?: string;
  phone_number?: string;
  comment?: string;
  country?: string;
  address?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  method?: 'M-PESA' | 'CARD-PAYMENT';
  card_tarrif?: 'BUSINESS-PAYS' | 'CUSTOMER-PAYS';
  mobile_tarrif?: 'BUSINESS-PAYS' | 'CUSTOMER-PAYS';
}

export interface IntaSendWebhookPayload {
  invoice_id: string;
  state: 'PENDING' | 'PROCESSING' | 'COMPLETE' | 'FAILED' | 'REFUNDED';
  provider: string;
  charges: string;
  net_amount: string;
  currency: string;
  value: string;
  account: string;
  api_ref: string;
  host: string;
  failed_reason: string | null;
  failed_code: string | null;
  failed_code_link: string;
  created_at: string;
  updated_at: string;
  challenge: string;
}

export class IntaSendService {
  /**
   * Create a checkout link for payment collection
   */
  static async createCheckoutLink(data: ChargePayload) {
    if (!INTASEND_PUBLISHABLE_KEY || !INTASEND_SECRET_KEY) {
      console.warn('IntaSend not configured, returning mock URL');
      return {
        url: `https://example.com/mock-checkout?ref=${data.api_ref}&amount=${data.amount}`,
        id: 'MOCK_' + Date.now()
      };
    }

    try {
      const collection = intasend.collection();
      
      const payload = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        host: data.host,
        amount: data.amount,
        currency: data.currency || 'USD',
        api_ref: data.api_ref,
        redirect_url: data.redirect_url,
        ...(data.phone_number && { phone_number: data.phone_number }),
        ...(data.comment && { comment: data.comment }),
        ...(data.country && { country: data.country }),
        ...(data.address && { address: data.address }),
        ...(data.city && { city: data.city }),
        ...(data.state && { state: data.state }),
        ...(data.zipcode && { zipcode: data.zipcode }),
        method: data.method || 'CARD-PAYMENT',
        ...(data.card_tarrif && { card_tarrif: data.card_tarrif }),
        ...(data.mobile_tarrif && { mobile_tarrif: data.mobile_tarrif }),
      };

      const response = await collection.charge(payload);
      
      return {
        url: response.url,
        id: response.id || response.invoice_id
      };
    } catch (error: any) {
      console.error('IntaSend Checkout Error:', error?.response?.data || error.message);
      throw new Error(error?.response?.data?.message || 'Failed to create checkout link');
    }
  }

  /**
   * Verify webhook payload
   * IntaSend uses challenge field for verification
   */
  static verifyWebhook(payload: IntaSendWebhookPayload): boolean {
    // In production, verify the challenge field matches your expected value
    // For test environment, challenge will be "testnet"
    const expectedChallenge = INTASEND_IS_TEST ? 'testnet' : process.env.INTASEND_CHALLENGE;
    
    if (expectedChallenge && payload.challenge !== expectedChallenge) {
      console.error('Invalid webhook challenge:', payload.challenge);
      return false;
    }
    
    return true;
  }

  /**
   * Check if in test mode
   */
  static isTestMode(): boolean {
    return INTASEND_IS_TEST;
  }
}

export const intaSendClient = intasend;
