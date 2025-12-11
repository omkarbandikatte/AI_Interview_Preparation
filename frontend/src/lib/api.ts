const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

async function postEvent<T>(event: string, data?: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${API_BASE}/vapi-webhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event, data }),
  });

  if (!res.ok) {
    throw new Error(`API error ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export async function startInterview() {
  return postEvent<{ response: string }>("call.started");
}

export async function sendTranscription(text: string) {
  return postEvent<{ response: string }>("input.transcription.completed", { text });
}

export async function endInterview(conversation: unknown) {
  return postEvent<{ response: any }>("call.ended", { conversation });
}

export function getApiBase() {
  return API_BASE;
}

