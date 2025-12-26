import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { API_ENDPOINT } from "$env/static/private";
import type { IdentityFormData } from "../../identity/identity.storage";
import type { LogEntry } from "../../results/+page";

interface SubmitResultsRequestBody {
  identityData: IdentityFormData | null;
  logs: LogEntry[];
  score: string;
}

interface SubmitResultsDTO {
  gender: string;
  age: string;
  profession: string;
  jobType: string;
  specialty: string;
  workplace: string;
  region: string;
  ethnicOrigin: string;
  score: number;
  logs: string;
  latency: number;
}

function transformToDTO(body: SubmitResultsRequestBody): SubmitResultsDTO {
  const { identityData, score, logs } = body;

  return {
    gender: identityData?.sexe || "",
    age: identityData?.age || "",
    profession: identityData?.profession || "",
    jobType: identityData?.typePoste || "",
    specialty: identityData?.specialite || "",
    workplace: identityData?.structure || "",
    region: identityData?.region || "",
    ethnicOrigin: identityData?.origineEthnique || "",
    score: parseFloat(score) || 0,
    logs: JSON.stringify(logs),
    latency:
      logs.map((log) => log.latency || 0).reduce((a, b) => a + b, 0) || -1,
  };
}

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = (await request.json()) as SubmitResultsRequestBody;
    const dto = transformToDTO(body);

    // Post to Google Apps Script
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      return json(
        { error: "Failed to submit results" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return json({ success: true, data });
  } catch (error) {
    console.error("Error submitting results:", error);
    return json({ error: "Failed to submit results" }, { status: 500 });
  }
};
