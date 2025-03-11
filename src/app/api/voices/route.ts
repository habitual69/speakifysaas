import { NextResponse } from "next/server";
import { createClient } from "../../../../supabase/server";

// Cache the voices to avoid repeated API calls
let cachedVoices: any[] | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 3600000; // 1 hour in milliseconds

export async function GET() {
  try {
    const supabase = await createClient();

    // Get the authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Check if we need to fetch fresh data
    const now = Date.now();
    if (!cachedVoices || now - lastFetchTime > CACHE_DURATION) {
      const response = await fetch("https://api.speakify.eu.org/api/v1/voices");

      if (!response.ok) {
        throw new Error(`Failed to fetch voices: ${response.status}`);
      }

      cachedVoices = await response.json();
      lastFetchTime = now;
    }

    // If user is not authenticated or not premium, filter out premium voices
    let voices = [...cachedVoices!];

    if (user) {
      // Get user subscription info
      const { data: userData } = await supabase
        .from("users")
        .select("subscription_tier")
        .eq("id", user.id)
        .single();

      const isPremium = userData?.subscription_tier === "premium";

      // For demo purposes, we'll mark some voices as premium
      // In a real implementation, this would be determined by the API
      if (!isPremium) {
        // Filter out premium voices (for demo, we'll consider some languages as premium)
        const premiumLanguages = ["Arabic", "Chinese", "Japanese", "Korean"];
        voices = voices.filter(
          (voice) => !premiumLanguages.includes(voice.Language),
        );
      }
    } else {
      // Not logged in, filter out premium voices
      const premiumLanguages = ["Arabic", "Chinese", "Japanese", "Korean"];
      voices = voices.filter(
        (voice) => !premiumLanguages.includes(voice.Language),
      );
    }

    return NextResponse.json(voices);
  } catch (error: any) {
    console.error("Error fetching voices:", error);
    return NextResponse.json(
      { error: `Error fetching voices: ${error.message}` },
      { status: 500 },
    );
  }
}
