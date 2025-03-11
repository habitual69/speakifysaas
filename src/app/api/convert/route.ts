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
    let apiResponse;
    try {
      // Create form data as the API expects application/x-www-form-urlencoded
      const formData = new URLSearchParams();
      formData.append('input_text', text);
      formData.append('voice', voice);
      formData.append('output_name', `speakify_${Date.now()}`);

      apiResponse = await fetch(
        "https://api.speakify.eu.org/api/v1/convert",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Accept": "application/json"
          },
          body: formData.toString(),
        },
      );

      console.log("External API request body:", formData.toString());
      console.log("External API response status:", apiResponse.status);
      // Fix the Headers iteration issue by converting to an object differently
      console.log(
        "External API response headers:",
        Object.fromEntries(apiResponse.headers.entries()),
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
        return NextResponse.json(
          { error: `Failed to parse API response: ${responseText}` },
          { status: 500 },
        );
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

      // Add enhanced response data
      const enhancedResponse = {
        ...responseData,
        statusCheckUrl: `/api/status/${responseData.task_id}`,
        initialProgress: 0,
        estimatedTimeSeconds: Math.ceil(text.length / 100),
      };

      // Record the conversion in the database if user is logged in
      if (user && responseData.task_id) {
        const { error: conversionError } = await supabase
          .from("conversions")
          .insert({
            user_id: user.id,
            text: text,
            voice_id: voice,
            token_count: tokenCount,
            audio_url: "",
            task_id: responseData.task_id,
            progress: 0,
            status: "processing",
          });

        if (conversionError) {
          console.error("Error recording conversion:", conversionError);
        }
      }

      return NextResponse.json(enhancedResponse);
    } catch (fetchError: unknown) {
      // Fix the unknown type error by properly typing the error
      console.error("Fetch error when calling external API:", fetchError);
      return NextResponse.json(
        {
          error: `Network error when calling external API: ${
            fetchError instanceof Error ? fetchError.message : String(fetchError)
          }`,
        },
        { status: 500 },
      );
    }
  } catch (error: any) {
    console.error("Error in conversion:", error);
    return NextResponse.json(
      { error: `Conversion error: ${error.message}` },
      { status: 500 },
    );
  }
}
