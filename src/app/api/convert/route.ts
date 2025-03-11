import { NextResponse } from "next/server";
import { createClient } from "../../../../supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    // Get the authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Parse request body
    const body = await req.json();
    console.log("Request body:", body);

    const text = body.text;
    const voice = body.voice || body.voice_id;

    if (!text || !voice) {
      return NextResponse.json(
        {
          error: `Text and voice are required. Received: text=${!!text}, voice=${!!voice}`,
        },
        { status: 400 },
      );
    }

    // Calculate token count (roughly 1 token per 4 characters)
    const tokenCount = Math.ceil(text.length / 4);

    // Check if user is authenticated
    if (user) {
      // Get user subscription info
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("subscription_tier, monthly_token_limit, tokens_used")
        .eq("id", user.id)
        .single();

      if (userError) {
        return NextResponse.json(
          { error: "Failed to get user data" },
          { status: 500 },
        );
      }

      // Check token limits for free users
      if (userData.subscription_tier !== "premium") {
        const newTokensUsed = userData.tokens_used + tokenCount;

        if (newTokensUsed > userData.monthly_token_limit) {
          return NextResponse.json(
            {
              error: "Token limit exceeded",
              limit: userData.monthly_token_limit,
              used: userData.tokens_used,
              requested: tokenCount,
            },
            { status: 403 },
          );
        }

        // Update tokens used
        const { error: updateError } = await supabase
          .from("users")
          .update({ tokens_used: newTokensUsed })
          .eq("id", user.id);

        if (updateError) {
          console.error("Error updating token usage:", updateError);
        }
      }
    } else {
      // For anonymous users, check if under free limit
      if (tokenCount > 10000) {
        return NextResponse.json(
          {
            error: "Token limit exceeded for anonymous users",
            limit: 10000,
            requested: tokenCount,
          },
          { status: 403 },
        );
      }
    }

    // Prepare request body
    const requestBody = {
      input_text: text,
      voice: voice,
      output_name: `speakify_${Date.now()}`,
    };
    console.log(
      "Sending request to external API with body:",
      JSON.stringify(requestBody),
    );

    // Call the external API to start the conversion
    try {
      const apiResponse = await fetch(
        "https://api.speakify.eu.org/api/v1/convert",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        },
      );

      console.log("External API response status:", apiResponse.status);
      console.log(
        "External API response headers:",
        Object.fromEntries([...apiResponse.headers]),
      );

      // Try to get response text regardless of status
      const responseText = await apiResponse.text();
      console.log("External API response text:", responseText);

      // Parse JSON if possible
      let responseData;
      try {
        responseData = JSON.parse(responseText);
        console.log("External API response parsed:", responseData);
      } catch (parseError) {
        console.error("Failed to parse response as JSON:", parseError);
      }

      if (!apiResponse.ok) {
        return NextResponse.json(
          {
            error:
              responseData?.message ||
              responseData?.error ||
              `API request failed with status ${apiResponse.status}`,
          },
          { status: apiResponse.status },
        );
      }

      return NextResponse.json(responseData);
    } catch (fetchError) {
      console.error("Fetch error when calling external API:", fetchError);
      return NextResponse.json(
        {
          error: `Network error when calling external API: ${fetchError.message}`,
        },
        { status: 500 },
      );
    }

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json();
      return NextResponse.json(
        { error: errorData.message || "API request failed" },
        { status: apiResponse.status },
      );
    }

    const conversionData = await apiResponse.json();
    console.log("Conversion API response:", conversionData);

    // Record the conversion in the database if user is logged in
    if (user) {
      const { error: conversionError } = await supabase
        .from("conversions")
        .insert({
          user_id: user.id,
          text: text,
          voice_id: voice,
          token_count: tokenCount,
          audio_url: "", // Will be updated when the conversion is complete
          task_id: conversionData.task_id,
        });

      if (conversionError) {
        console.error("Error recording conversion:", conversionError);
      }
    }

    return NextResponse.json(conversionData);
  } catch (error: any) {
    console.error("Error in conversion:", error);
    return NextResponse.json(
      { error: `Conversion error: ${error.message}` },
      { status: 500 },
    );
  }
}
