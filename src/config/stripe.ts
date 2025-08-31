import Stripe from 'stripe';
import { config } from '.';


  
if (!config.stripe.subscription_webhook_sec) {
    throw new Error('STRIPE_SECRET_KEY is not defined');
}

const stripe = new Stripe(config?.stripe.subscription_webhook_sec!, {
    apiVersion: "2025-02-24.acacia",
});
  
export default stripe;