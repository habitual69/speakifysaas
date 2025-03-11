/**
 * API client for interacting with the Speakify API
 */

export interface Voice {
  Artist: string;
  Language: string;
  Country: string;
  Gender: string;
  Content_Categories: string;
  Voice_Personalities: string;
  Voice: string;
}

export interface ConversionResponse {
  task_id: string;
  message: string;
  status_endpoint: string;
}

export interface StatusResponse {
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  output_file: string | null;
  error: string | null;
}

// Use our own API endpoints that proxy to the external API
const API_BASE_URL = "/api";

/**
 * Fetch all available voices from the API
 */
export async function getVoices(): Promise<Voice[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/voices`);

    if (!response.ok) {
      throw new Error(`Failed to fetch voices: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching voices:", error);
    throw error;
  }
}

/**
 * Start a text-to-speech conversion task
 */
export async function convertTextToSpeech(
  text: string,
  voiceId: string,
): Promise<ConversionResponse> {
  try {
    console.log(`Client: Converting text with voice ID: ${voiceId}`);
    console.log(`Client: Text length: ${text.length} characters`);

    const requestBody = {
      text: text,
      input_text: text,
      voice: voiceId,
      voice_id: voiceId,
      output_name: `speakify_${Date.now()}`,
    };
    console.log("Client: Request body:", requestBody);

    const response = await fetch(`${API_BASE_URL}/convert`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    console.log(`Client: Conversion API response status: ${response.status}`);

    // Get the raw text response first
    const responseText = await response.text();
    console.log("Client: Raw response text:", responseText);

    // Try to parse as JSON
    let responseData;
    try {
      responseData = JSON.parse(responseText);
      console.log("Client: Parsed response:", responseData);
    } catch (parseError) {
      console.error("Client: Failed to parse response as JSON:", parseError);
      throw new Error(`Invalid JSON response: ${responseText}`);
    }

    if (!response.ok) {
      throw new Error(
        responseData.error || `Failed to start conversion: ${response.status}`,
      );
    }

    return responseData;
  } catch (error) {
    console.error("Error starting conversion:", error);
    throw error;
  }
}

/**
 * Check the status of a conversion task
 */
export async function getConversionStatus(
  taskId: string,
): Promise<StatusResponse> {
  try {
    console.log(`Client: Checking status for task ID: ${taskId}`);

    const response = await fetch(`${API_BASE_URL}/status/${taskId}`);
    console.log(`Client: Status API response status: ${response.status}`);

    // Get the raw text response first
    const responseText = await response.text();
    console.log("Client: Raw status response text:", responseText);

    // Try to parse as JSON
    let responseData;
    try {
      responseData = JSON.parse(responseText);
      console.log("Client: Parsed status response:", responseData);
    } catch (parseError) {
      console.error(
        "Client: Failed to parse status response as JSON:",
        parseError,
      );
      throw new Error(`Invalid JSON response: ${responseText}`);
    }

    if (!response.ok) {
      throw new Error(
        responseData.error || `Failed to get status: ${response.status}`,
      );
    }

    return responseData;
  } catch (error) {
    console.error("Error checking conversion status:", error);
    throw error;
  }
}

/**
 * Get the URL for an audio file
 */
export function getAudioUrl(filename: string): string {
  return `${API_BASE_URL}/audio/${filename}`;
}

/**
 * Poll for conversion status until completed or failed
 */
export async function pollConversionStatus(
  taskId: string,
  onProgress?: (progress: number) => void,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const checkStatus = async () => {
      try {
        console.log("Polling status for task ID:", taskId);
        const statusResponse = await getConversionStatus(taskId);
        console.log("Status response:", statusResponse);

        if (onProgress && typeof statusResponse.progress === "number") {
          onProgress(statusResponse.progress);
        }

        if (
          statusResponse.status === "completed" &&
          statusResponse.output_file
        ) {
          resolve(getAudioUrl(statusResponse.output_file));
        } else if (statusResponse.status === "failed") {
          reject(new Error(statusResponse.error || "Conversion failed"));
        } else {
          // Still processing, check again after a delay
          setTimeout(checkStatus, 2000); // Increased delay to 2 seconds
        }
      } catch (error) {
        console.error("Error in polling:", error);
        reject(error);
      }
    };

    // Start checking status
    checkStatus();
  });
}
