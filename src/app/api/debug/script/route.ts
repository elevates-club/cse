import { NextResponse } from "next/server";

export async function GET() {
  const SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;
  if (!SCRIPT_URL) return NextResponse.json({ status: "error", reason: "GOOGLE_SCRIPT_URL not set in .env.local" });

  let rawText = "";
  let httpStatus = 0;
  try {
    const res = await fetch(SCRIPT_URL, { cache: "no-store" });
    httpStatus = res.status;
    rawText = await res.text();
  } catch (e: any) {
    return NextResponse.json({ status: "fetch_failed", error: e?.message });
  }

  // Try to parse as JSON
  let parsed: any;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    return NextResponse.json({
      status: "not_json",
      http_status: httpStatus,
      preview: rawText.slice(0, 600),
    });
  }

  // Script returned a JSON error object
  if (!Array.isArray(parsed)) {
    return NextResponse.json({
      status: "script_error",
      http_status: httpStatus,
      script_response: parsed,
    });
  }

  // Separate images and videos
  const images = parsed.filter((f: any) => String(f.mimeType || "").startsWith("image/"));
  const videos = parsed.filter((f: any) => String(f.mimeType || "").startsWith("video/"));

  const dateRegex = /(20[0-3]\d)(0[1-9]|1[0-2])([0-2]\d|3[01])/;
  const noDate = parsed.filter((f: any) => !f.imageMediaMetadata?.time && !dateRegex.test(String(f.name || "")));

  return NextResponse.json({
    status: "ok",
    total: parsed.length,
    images: images.length,
    videos: videos.length,
    // Show first 10 video filenames so we can see the naming pattern
    video_names: videos.slice(0, 10).map((f: any) => ({
      name: f.name,
      createdTime: f.createdTime,
      modifiedTime: f.modifiedTime,
      hasDateInName: dateRegex.test(String(f.name || "")),
    })),
    no_date_count: noDate.length,
    sample: parsed.slice(0, 3),
  });
}
