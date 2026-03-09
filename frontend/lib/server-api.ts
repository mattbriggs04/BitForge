import { ProblemDetail, ProblemSummary } from "@/lib/types";

const BACKEND_API_URL =
  process.env.BACKEND_API_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

async function backendFetch<T>(path: string): Promise<T> {
  const response = await fetch(`${BACKEND_API_URL}${path}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Backend request failed (${response.status})`);
  }

  return response.json() as Promise<T>;
}

export async function getProblemsServer(params: {
  q?: string;
  difficulty?: string;
  category?: string;
  tag?: string;
}): Promise<ProblemSummary[]> {
  const query = new URLSearchParams();
  if (params.q) query.set("q", params.q);
  if (params.difficulty) query.set("difficulty", params.difficulty);
  if (params.category) query.set("category", params.category);
  if (params.tag) query.set("tag", params.tag);

  const suffix = query.toString() ? `?${query.toString()}` : "";
  const payload = await backendFetch<{ items: ProblemSummary[] }>(`/api/v1/problems${suffix}`);
  return payload.items;
}

export async function getProblemServer(slug: string): Promise<ProblemDetail | null> {
  const response = await fetch(`${BACKEND_API_URL}/api/v1/problems/${slug}`, {
    cache: "no-store",
  });

  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`Backend request failed (${response.status})`);
  }

  return response.json() as Promise<ProblemDetail>;
}
