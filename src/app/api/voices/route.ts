import { NextResponse } from "next/server";
import { createClient } from "../../../../supabase/server";

// Disable caching for this route
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Cache the voices to avoid repeated API calls
let cachedVoices: any[] | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 3600000; // 1 hour in milliseconds

// Fallback voices in case the API fails
const fallbackVoices = [
  {
    Artist: "Emma Johnson",
    Language: "English",
    Country: "United States",
    Gender: "Female",
    Voice_Personalities: "Friendly, Professional",
    Voice: "en-US-Emma",
  },
  {
    Artist: "Michael Smith",
    Language: "English",
    Country: "United States",
    Gender: "Male",
    Voice_Personalities: "Authoritative, Clear",
    Voice: "en-US-Michael",
  },
  {
    Artist: "Sophie Williams",
    Language: "English",
    Country: "United Kingdom",
    Gender: "Female",
    Voice_Personalities: "Warm, Articulate",
    Voice: "en-GB-Sophie",
  },
  {
    Artist: "James Taylor",
    Language: "English",
    Country: "United Kingdom",
    Gender: "Male",
    Voice_Personalities: "Sophisticated, Formal",
    Voice: "en-GB-James",
  },
];

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
      try {
        const response = await fetch(
          "https://api.speakify.eu.org/api/v1/voices",
          {
            cache: "no-store",
            headers: {
              Accept: "application/json",
            },
          },
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch voices: ${response.status}`);
        }

        cachedVoices = await response.json();
        lastFetchTime = now;
      } catch (fetchError) {
        console.error(
          "Error fetching voices from API, using fallback:",
          fetchError,
        );
        // Use fallback voices if API fails
        cachedVoices = fallbackVoices;
        lastFetchTime = now;
      }
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

    // Return with cache control headers
    return new NextResponse(JSON.stringify(voices), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error: any) {
    console.error("Error fetching voices:", error);

    // Return fallback voices in case of error
    const filteredFallbackVoices = fallbackVoices.filter(
      (voice) =>
        !["Arabic", "Chinese", "Japanese", "Korean"].includes(voice.Language),
    );

    return new NextResponse(JSON.stringify(filteredFallbackVoices), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  }
}
