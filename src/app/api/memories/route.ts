import { NextResponse } from "next/server";

export async function GET() {
  const SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;

  console.log("Memory API: Fetching from Google Script...");
  
  if (!SCRIPT_URL) {
    console.error("Memory API Error: GOOGLE_SCRIPT_URL is missing in .env.local");
    return NextResponse.json([]);
  }

  // If the user hasn't set up their Drive yet, return an empty list instead of a crash
  if (SCRIPT_URL.includes("AKfycb...")) {
    console.warn("Memory API: Using placeholder SCRIPT_URL. Please set your own.");
    return NextResponse.json([]);
  }

  try {
    const response = await fetch(SCRIPT_URL, { 
      next: { revalidate: 3600 }, // Cache the list of memories for 1 hour to ensure instant page loads
      headers: { "Accept": "application/json" }
    });
    
    if (!response.ok) {
      console.error(`Memory API Error: Fetch failed with status ${response.status}`);
      return NextResponse.json([]);
    }

    const data = await response.json();
    console.log(`Memory API Result: Received ${Array.isArray(data) ? data.length : 0} items from Drive.`);

    // Defensive check: If Google Script returns an error or non-array, fail gracefully
    if (!Array.isArray(data)) {
      console.warn("Memory API Error: Google Script returned non-array data:", data);
      return NextResponse.json([]);
    }

    // Sort by date (newest first) and limit to 60 for maximum loading speed
    const sortedData = data.sort((a: any, b: any) => 
      new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime()
    ).slice(0, 60);

    // Transform data for the frontend
    const memories = sortedData.map((file: any) => ({
      id: file.id,
      // Using our high-reliability server-side proxy to guarantee visibility
      src: `/api/memories/image?id=${file.id}`,
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
