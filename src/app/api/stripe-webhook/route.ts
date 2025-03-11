import { createClient } from "../../../../supabase/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
});

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature") as string;

  let event: Stripe.Event;

  // Verify the webhook signature
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || "",
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 },
    );
  }

  // Handle the event
  const supabase = await createClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = session.customer as string;
        const userId = session.client_reference_id;

        if (!userId) {
          throw new Error("No user ID found in session");
        }

        // Update user subscription status
        const { error } = await supabase
          .from("users")
          .update({
            subscription_tier: "premium",
            subscription_start_date: new Date().toISOString(),
            subscription_end_date: new Date(
              Date.now() + 30 * 24 * 60 * 60 * 1000,
            ).toISOString(), // 30 days from now
            monthly_token_limit: null, // null means unlimited
          })
          .eq("id", userId);

        if (error) {
          throw new Error(`Error updating user: ${error.message}`);
        }

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Find user with this customer ID and downgrade to free
        const { data: users, error: findError } = await supabase
          .from("users")
          .select("id")
          .eq("stripe_customer_id", customerId);

        if (findError || !users || users.length === 0) {
          throw new Error("No user found with this customer ID");
        }

        const userId = users[0].id;

        // Update user subscription status
        const { error } = await supabase
          .from("users")
          .update({
            subscription_tier: "free",
            subscription_end_date: new Date().toISOString(),
            monthly_token_limit: 10000,
            tokens_used: 0,
          })
          .eq("id", userId);

        if (error) {
          throw new Error(`Error updating user: ${error.message}`);
        }

        break;
      }

      // Add other event types as needed

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error(`Webhook error: ${error.message}`);
    return NextResponse.json(
      { error: `Webhook handler failed: ${error.message}` },
      { status: 500 },
    );
  }
}
