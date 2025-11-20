import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async () => {
  return json({
    message: "Hello from the SvelteKit API!",
    timestamp: new Date().toISOString(),
  });
};

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();

  return json({
    message: "Data received successfully",
    receivedData: body,
    timestamp: new Date().toISOString(),
  });
};
