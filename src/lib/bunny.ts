import type { Tenant } from "@prisma/client";

export type BunnyConfig = {
  libraryId: string;
  apiKey: string;
};

/** Resolve Bunny Stream config for a tenant, falling back to platform env. */
export function getBunnyConfig(tenant: Tenant): BunnyConfig | null {
  const libraryId =
    tenant.bunnyLibraryId || process.env.BUNNY_STREAM_LIBRARY_ID || "";
  const apiKey = tenant.bunnyApiKey || process.env.BUNNY_API_KEY || "";
  if (!libraryId || !apiKey) return null;
  return { libraryId, apiKey };
}

const BASE = "https://video.bunnycdn.com/library";

/** Create a video object in the library and return its GUID. */
export async function createBunnyVideo(
  config: BunnyConfig,
  title: string
): Promise<string> {
  const res = await fetch(`${BASE}/${config.libraryId}/videos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      AccessKey: config.apiKey,
    },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) {
    throw new Error(`Bunny create video failed: ${res.status}`);
  }
  const data = (await res.json()) as { guid: string };
  return data.guid;
}

/** Upload binary video data to an existing video object. */
export async function uploadBunnyVideo(
  config: BunnyConfig,
  videoId: string,
  data: ArrayBuffer
): Promise<void> {
  const res = await fetch(`${BASE}/${config.libraryId}/videos/${videoId}`, {
    method: "PUT",
    headers: {
      AccessKey: config.apiKey,
      "Content-Type": "application/octet-stream",
    },
    body: data,
  });
  if (!res.ok) {
    throw new Error(`Bunny upload failed: ${res.status}`);
  }
}

/** Fetch a video's metadata (e.g. length in seconds once processed). */
export async function getBunnyVideo(
  config: BunnyConfig,
  videoId: string
): Promise<{ length?: number; status?: number } | null> {
  const res = await fetch(`${BASE}/${config.libraryId}/videos/${videoId}`, {
    headers: { AccessKey: config.apiKey, Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { length?: number; status?: number };
  return data;
}
