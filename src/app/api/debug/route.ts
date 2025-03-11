import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Test all external API endpoints
    const endpoints = [
      { name: "Voices API", url: "https://api.speakify.eu.org/api/v1/voices" },
      {
        name: "Status API (with dummy ID)",
        url: "https://api.speakify.eu.org/api/v1/status/test-task-id",
      },
    ];

    const results = {};

    for (const endpoint of endpoints) {
      try {
        console.log(`Testing endpoint: ${endpoint.name} (${endpoint.url})`);
        const response = await fetch(endpoint.url);

        const responseText = await response.text();
        let responseData;
        try {
          responseData = JSON.parse(responseText);
        } catch (e) {
          responseData = { parseError: true, text: responseText };
        }

        results[endpoint.name] = {
          status: response.status,
          ok: response.ok,
          headers: Object.fromEntries([...response.headers]),
          data: responseData,
        };
      } catch (error) {
        results[endpoint.name] = {
          error: error.message,
          stack: error.stack,
        };
      }
    }

    // Test convert endpoint with a small payload
    try {
      console.log("Testing convert endpoint");
      const convertResponse = await fetch(
        "https://api.speakify.eu.org/api/v1/convert",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            input_text: "Hello world",
            voice: "en-US-JennyNeural",
            output_name: `test_${Date.now()}`,
          }),
        },
      );

      const responseText = await convertResponse.text();
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        responseData = { parseError: true, text: responseText };
      }

      results["Convert API"] = {
        status: convertResponse.status,
        ok: convertResponse.ok,
        headers: Object.fromEntries([...convertResponse.headers]),
        data: responseData,
      };
    } catch (error) {
      results["Convert API"] = {
        error: error.message,
        stack: error.stack,
      };
    }

    return NextResponse.json({
      message: "API Debug Results",
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Debug API error:", error);
    return NextResponse.json(
      { error: `Debug API error: ${error.message}`, stack: error.stack },
      { status: 500 },
    );
  }
}
