import { NextResponse } from "next/server";
import { requireAdminContext } from "@/lib/admin";
import {
  getBunnyConfig,
  createBunnyVideo,
  uploadBunnyVideo,
} from "@/lib/bunny";

// Allow larger request bodies for video uploads.
export const maxDuration = 300;

export async function POST(request: Request) {
  let tenant;
  try {
    ({ tenant } = await requireAdminContext());
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const config = getBunnyConfig(tenant);
  if (!config) {
    return NextResponse.json(
      {
        error:
          "Bunny Stream is not configured. Add a library ID + API key in Settings.",
      },
      { status: 503 }
    );
  }

  const form = await request.formData();
  const file = form.get("file");
  const title = String(form.get("title") ?? "Lesson video");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  try {
    const videoId = await createBunnyVideo(config, title);
    await uploadBunnyVideo(config, videoId, await file.arrayBuffer());
    return NextResponse.json({ videoId });
  } catch (err) {
    console.error("Video upload failed:", err);
    return NextResponse.json(
      { error: "Upload failed. Check your Bunny credentials." },
      { status: 502 }
    );
  }
}
