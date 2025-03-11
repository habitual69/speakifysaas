// Follow this setup guide to integrate the Deno runtime into your application:
// https://deno.com/manual/examples/supabase-functions

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

export default async function handler(req: Request) {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      },
    );

    // Get the session of the authenticated user
    const {
      data: { session },
    } = await supabaseClient.auth.getSession();

    // Check if user is authenticated and has premium subscription
    let isPremium = false;
    if (session) {
      const userId = session.user.id;

      // Get user subscription info
      const { data: userData } = await supabaseClient
        .from("users")
        .select("subscription_tier")
        .eq("id", userId)
        .single();

      isPremium = userData?.subscription_tier === "premium";
    }

    // Get voices based on subscription status
    let query = supabaseClient.from("voices").select("*");

    if (!isPremium) {
      // If not premium, only return non-premium voices
      query = query.eq("is_premium", false);
    }

    const { data: voices, error } = await query.order("name");

    if (error) {
      return new Response(JSON.stringify({ error: "Failed to fetch voices" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    return new Response(
      JSON.stringify({
        voices,
        isPremium,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
}
