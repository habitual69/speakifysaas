import { createClient } from "../../../../supabase/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
});

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    // Get the authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in to create a checkout session" },
        { status: 401 },
      );
    }

    // Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Speakify Premium",
              description: "Unlimited text-to-speech conversions",
            },
            unit_amount: 500, // $5.00
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/dashboard?payment=success`,
      cancel_url: `${req.headers.get("origin")}/dashboard?payment=cancelled`,
      client_reference_id: user.id, // To identify the user in webhook
    });

    // Store the Stripe customer ID in the user record
    if (session.customer) {
      const { error } = await supabase
        .from("users")
        .update({
          stripe_customer_id: session.customer,
        })
        .eq("id", user.id);

      if (error) {
        console.error("Error updating user with Stripe customer ID:", error);
      }
    }

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: `Error creating checkout session: ${error.message}` },
      { status: 500 },
    );
  }
}
