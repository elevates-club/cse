import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const width = searchParams.get("w") || "1200"; // Increased default for quality

  if (!id) {
    return new NextResponse("File ID is required", { status: 400 });
  }

  // Use the high-resolution thumbnail endpoint with dynamic sizing
  const googleImageUrl = `https://drive.google.com/thumbnail?id=${id}&sz=w${width}`;

  try {
    const response = await fetch(googleImageUrl, {
      next: { revalidate: 86400 } // cache individual images for 24h (they never change)
    });

    if (!response.ok) {
      console.error(`Proxy Error: Failed to fetch image ${id} (Status: ${response.status})`);
      return new NextResponse("Failed to fetch image", { status: response.status });
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";
    const buffer = await response.arrayBuffer();

    // Use sharp to compress and convert to WebP with high quality
    const optimizedBuffer = await import("sharp").then(async (sharp) => {
      return await sharp.default(Buffer.from(buffer))
        .webp({ quality: 80, effort: 4 }) // Restored quality for a sharp look
        .toBuffer();
    });

    return new NextResponse(new Uint8Array(optimizedBuffer), {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=31536000, immutable", // Browser caching (1 year)
        "Access-Control-Allow-Origin": "*", // Open CORS for our own frames
      },
    });
  } catch (error) {
    console.error(`Proxy Exception: ${error}`);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
