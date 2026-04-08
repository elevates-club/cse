export interface Memory {
  id: string;
  src: string;
  date: string;
  fullRes: string;
}

export async function getMemoriesInternal(): Promise<Memory[]> {
  const SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;

  if (!SCRIPT_URL || SCRIPT_URL.includes("AKfycb...")) {
    console.warn("Memories Lib: SCRIPT_URL is missing or placeholder.");
    return [];
  }

  try {
    const response = await fetch(SCRIPT_URL, { 
      next: { revalidate: 3600 }, // Cache the list of memories for 1 hour
      headers: { "Accept": "application/json" }
    });
    
    if (!response.ok) {
      console.error(`Memories Lib Error: Fetch failed with status ${response.status}`);
      return [];
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      console.warn("Memories Lib Error: Google Script returned non-array data.");
      return [];
    }

    // Sort by date (newest first) and limit to 60 for speed
    const sortedData = data.sort((a: any, b: any) => 
      new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime()
    ).slice(0, 60);

    // Transform data for the frontend
    return sortedData.map((file: any) => ({
      id: file.id,
      src: `/api/memories/image?id=${file.id}`,
      date: new Date(file.createdTime).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }),
      fullRes: `https://drive.google.com/uc?export=view&id=${file.id}`
    }));
  } catch (error) {
    console.error("Memories Lib Exception:", error);
    return [];
  }
}
