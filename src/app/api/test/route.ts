import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Test the external API connection
    const response = await fetch("https://api.speakify.eu.org/api/v1/voices");

    if (!response.ok) {
      return NextResponse.json(
        { error: `API connection failed: ${response.status}` },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json({
      message: "API connection successful",
      sample_data: data.slice(0, 3), // Just return first 3 items for verification
    });
  } catch (error: any) {
    console.error("API test error:", error);
    return NextResponse.json(
      { error: `API test error: ${error.message}` },
      { status: 500 },
    );
  }
}
