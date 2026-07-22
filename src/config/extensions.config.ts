export interface BillingConfig {
  publishKey: string;
  secretKey: string;
  checkoutCancel: string;
  checkoutSuccess: string;
}

export const billing: BillingConfig = {
  secretKey: process.env.STRIPE_SECRET_KEY || '',
  publishKey: process.env.STRIPE_PUBLISH_KEY || '',
  checkoutCancel: process.env.STRIPE_CHECKOUT_CANCEL || '',
  checkoutSuccess: process.env.STRIPE_CHECKOUT_SUCCESS || '',
};
