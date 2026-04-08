import { NextResponse } from "next/server";
import { getMemoriesInternal } from "@/lib/memories";

export async function GET() {
  try {
    const memories = await getMemoriesInternal();
    return NextResponse.json(memories);
  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json([]);
  }
}
