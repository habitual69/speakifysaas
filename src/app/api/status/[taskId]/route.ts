import { NextResponse } from "next/server";
import { createClient } from "../../../../../supabase/server";

export async function GET(
  req: Request,
  { params }: { params: { taskId: string } }
) {
  try {
    const taskId = params.taskId;
    const supabase = await createClient();

    if (!taskId) {
      return NextResponse.json(
        { error: "Task ID is required" },
        { status: 400 }
      );
    }

    // Get the authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Call the external API to check status
    const apiResponse = await fetch(
      `https://api.speakify.eu.org/api/v1/status/${taskId}`
    );

    const responseText = await apiResponse.text();
    let statusData;
    
    try {
      statusData = JSON.parse(responseText);
    } catch (parseError) {
      return NextResponse.json(
        { error: `Invalid status response: ${responseText}` },
        { status: 500 }
      );
    }

    if (!apiResponse.ok) {
      return NextResponse.json(
        { error: statusData?.error || "Failed to fetch status" },
        { status: apiResponse.status }
      );
    }

    // Update conversion record if user is logged in
    if (user && statusData.status) {
      const updateData: any = {
        progress: statusData.progress || 0,
        status: statusData.status,
      };

      if (statusData.status === "completed" && statusData.output_file) {
        updateData.audio_url = `/api/audio/${statusData.output_file}`;
      }

      const { error: updateError } = await supabase
        .from("conversions")
        .update(updateData)
        .eq("task_id", taskId)
        .eq("user_id", user.id);

      if (updateError) {
        console.error("Error updating conversion status:", updateError);
      }
    }

    // Return enhanced status information
    return NextResponse.json({
      ...statusData,
      progressPercentage: statusData.progress || 0,
      isComplete: statusData.status === "completed",
      isProcessing: statusData.status === "processing",
      hasError: !!statusData.error,
      audioUrl: statusData.status === "completed" && statusData.output_file
        ? `/api/audio/${statusData.output_file}`
        : null,
    });

  } catch (error: any) {
    console.error("Error checking status:", error);
    return NextResponse.json(
      { error: `Status check error: ${error.message}` },
      { status: 500 }
    );
  }
}
