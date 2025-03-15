import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  req: Request,
  { params }: { params: { filename: string } },
) {
  try {
    const filename = params.filename;

    if (!filename) {
      return NextResponse.json(
        { error: "Filename is required" },
        { status: 400 },
      );
    }

    // Call the external API to get the audio file
    const apiResponse = await fetch(
      `https://api.speakify.eu.org/api/v1/audio/${filename}`,
      { cache: "no-store" },
    );

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json();
      return NextResponse.json(
        { error: errorData.message || "API request failed" },
        { status: apiResponse.status },
      );
    }

    // Get the audio data as a blob
    const audioBlob = await apiResponse.blob();

    // Create a response with the audio data
    return new NextResponse(audioBlob, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error: any) {
    console.error("Error fetching audio:", error);
    return NextResponse.json(
      { error: `Audio fetch error: ${error.message}` },
      { status: 500 },
    );
  }
}
