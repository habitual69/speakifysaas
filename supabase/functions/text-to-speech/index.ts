// Follow this setup guide to integrate the Deno runtime into your application:
// https://deno.com/manual/examples/supabase-functions

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  text: string;
  voiceId: string;
}

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

    // Parse request body
    const { text, voiceId } = (await req.json()) as RequestBody;

    if (!text || !voiceId) {
      return new Response(
        JSON.stringify({ error: "Text and voiceId are required" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
    }

    // Calculate token count (roughly 1 token per 4 characters)
    const tokenCount = Math.ceil(text.length / 4);

    // Check if user is authenticated
    if (session) {
      const userId = session.user.id;

      // Get user subscription info
      const { data: userData, error: userError } = await supabaseClient
        .from("users")
        .select("subscription_tier, monthly_token_limit, tokens_used")
        .eq("id", userId)
        .single();

      if (userError) {
        return new Response(
          JSON.stringify({ error: "Failed to get user data" }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
          },
        );
      }

      // Check token limits for free users
      if (userData.subscription_tier === "free") {
        const newTokensUsed = userData.tokens_used + tokenCount;

        if (newTokensUsed > userData.monthly_token_limit) {
          return new Response(
            JSON.stringify({
              error: "Token limit exceeded",
              limit: userData.monthly_token_limit,
              used: userData.tokens_used,
              requested: tokenCount,
            }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 403,
            },
          );
        }

        // Update tokens used
        const { error: updateError } = await supabaseClient
          .from("users")
          .update({ tokens_used: newTokensUsed })
          .eq("id", userId);

        if (updateError) {
          console.error("Error updating token usage:", updateError);
        }
      }

      // In a real implementation, this would call an actual TTS API
      // For demo purposes, we're just returning a sample audio URL
      const audioUrl =
        "https://audio-samples.github.io/samples/mp3/blizzard_biased/sample-1.mp3";

      // Record the conversion in the database
      const { error: conversionError } = await supabaseClient
        .from("conversions")
        .insert({
          user_id: userId,
          text: text,
          voice_id: voiceId,
          token_count: tokenCount,
          audio_url: audioUrl,
        });

      if (conversionError) {
        console.error("Error recording conversion:", conversionError);
      }

      return new Response(
        JSON.stringify({
          audioUrl,
          tokenCount,
          success: true,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    } else {
      // For anonymous users, just check if under free limit
      if (tokenCount > 10000) {
        return new Response(
          JSON.stringify({
            error: "Token limit exceeded for anonymous users",
            limit: 10000,
            requested: tokenCount,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 403,
          },
        );
      }

      // In a real implementation, this would call an actual TTS API
      // For demo purposes, we're just returning a sample audio URL
      const audioUrl =
        "https://audio-samples.github.io/samples/mp3/blizzard_biased/sample-1.mp3";

      return new Response(
        JSON.stringify({
          audioUrl,
          tokenCount,
          success: true,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
}
