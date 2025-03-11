import { NextResponse } from "next/server";
import { createClient } from "../../../../../supabase/server";

export async function GET(
  req: Request,
  { params }: { params: { taskId: string } },
) {
  try {
    const taskId = params.taskId;

    if (!taskId) {
      return NextResponse.json(
        { error: "Task ID is required" },
        { status: 400 },
      );
    }

    console.log("API route: Checking status for task:", taskId);
    // Call the external API to check status
    try {
      const apiResponse = await fetch(
        `https://api.speakify.eu.org/api/v1/status/${taskId}`,
      );

      console.log("API status response status:", apiResponse.status);
      console.log(
        "API status response headers:",
        Object.fromEntries([...apiResponse.headers]),
      );

      // Try to get response text regardless of status
      const responseText = await apiResponse.text();
      console.log("API status response text:", responseText);

      // Parse JSON if possible
      let statusData;
      try {
        statusData = JSON.parse(responseText);
        console.log("API status response parsed:", statusData);
      } catch (parseError) {
        console.error("Failed to parse status response as JSON:", parseError);
        return NextResponse.json(
          { error: `Failed to parse status response: ${responseText}` },
          { status: 500 },
        );
      }

      if (!apiResponse.ok) {
        return NextResponse.json(
          {
            error:
              statusData?.message || statusData?.error || "API request failed",
          },
          { status: apiResponse.status },
        );
      }

      // If the conversion is complete and the user is logged in, update the conversion record
      if (statusData.status === "completed" && statusData.output_file) {
        const supabase = await createClient();

        // Get the authenticated user
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          // Find the conversion with this task ID
          const { data: conversions } = await supabase
            .from("conversions")
            .select("id")
            .eq("task_id", taskId)
            .eq("user_id", user.id);

          if (conversions && conversions.length > 0) {
            // Update the conversion with the audio URL
            const audioUrl = `https://api.speakify.eu.org/api/v1/audio/${statusData.output_file}`;

            const { error: updateError } = await supabase
              .from("conversions")
              .update({
                audio_url: audioUrl,
              })
              .eq("id", conversions[0].id);

            if (updateError) {
              console.error(
                "Error updating conversion with audio URL:",
                updateError,
              );
            }
          }
        }
      }

      return NextResponse.json(statusData);
    } catch (fetchError) {
      console.error("Fetch error when checking status:", fetchError);
      return NextResponse.json(
        { error: `Network error when checking status: ${fetchError.message}` },
        { status: 500 },
      );
    }
  } catch (error: any) {
    console.error("Error checking status:", error);
    return NextResponse.json(
      { error: `Status check error: ${error.message}` },
      { status: 500 },
    );
  }
}
