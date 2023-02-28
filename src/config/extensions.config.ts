export interface BillingConfig {
  publishKey: string;
  secretKey: string;
  checkoutCancel: string;
  checkoutSuccess: string;
}

export const billing: BillingConfig = {
  secretKey:
    'STRIPE_SECRET_KEY_REDACTED',
  publishKey:
    'STRIPE_PUBLISH_KEY_REDACTED',
  checkoutCancel: '',
  checkoutSuccess: '',
};
