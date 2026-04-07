import { NextResponse } from "next/server";

export async function GET() {
  const SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;

  // If the user hasn't set up their Drive yet, return an empty list instead of a crash
  if (!SCRIPT_URL || SCRIPT_URL.includes("AKfycb...")) {
    return NextResponse.json([]);
  }

  try {
    const response = await fetch(SCRIPT_URL, { cache: "no-store" });
    const data = await response.json();

    // Defensive check: If Google Script returns an error or non-array, fail gracefully
    if (!Array.isArray(data)) {
      console.warn("Google Script returned non-array data:", data);
      return NextResponse.json([]);
    }

    // Sort by date (oldest first)
    const sortedData = data.sort((a: any, b: any) => 
      new Date(a.createdTime).getTime() - new Date(b.createdTime).getTime()
    );

    // Transform data for the frontend
    const memories = sortedData.map((file: any) => ({
      id: file.id,
      src: `https://lh3.googleusercontent.com/u/0/d/${file.id}=s600`,
      date: new Date(file.createdTime).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }),
      fullRes: `https://drive.google.com/uc?export=view&id=${file.id}`
    }));

    return NextResponse.json(memories);
  } catch (error) {
    console.error("Failed to fetch Google Drive memories:", error);
    // Return empty array on error to prevent 500 error crashes
    return NextResponse.json([]);
  }
}
