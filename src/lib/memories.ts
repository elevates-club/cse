export interface Memory {
  id: string;
  src: string;
  date: string;       // Human-readable taken date, or "" if unknown
  sortDate: string;   // ISO string used for chronological sorting (always available)
  takenYear: string;  // "2022"–"2026" if known, otherwise "Unknown"
  fullRes: string;
  type: "image" | "video";
  mimeType?: string;
}

const fmt = (d: Date) =>
  d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

/**
 * Extracts YYYYMMDD from anywhere in a filename.
 * Covers: Android (20260318_…), WhatsApp (IMG-20260318-WA…), Android+prefix (IMG_20260318_…)
 * Returns null for iPhone files with no date (IMG_7057.HEIC, IMG_0861.JPG)
 */
function dateFromFilename(name: string): Date | null {
  const match = name.match(/(20[0-3]\d)(0[1-9]|1[0-2])([0-2]\d|3[01])/);
  if (match) {
    const d = new Date(`${match[1]}-${match[2]}-${match[3]}`);
    if (!isNaN(d.getTime())) return d;
  }
  return null;
}

/**
 * For iPhone / unnamed image files (IMG_7057.HEIC, IMG_0861.JPG etc.) that have
 * no date in their filename, fetch the first 64KB and search raw bytes for an
 * EXIF date string "YYYY:MM:DD HH:MM:SS" (stored as plain ASCII in JPEG/HEIC).
 */
async function fetchExifDateFromFile(fileId: string): Promise<string | null> {
  try {
    const url = `https://drive.usercontent.google.com/download?id=${fileId}&export=download&confirm=t`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);

    let res: Response;
    try {
      res = await fetch(url, {
        headers: { Range: "bytes=0-65535" },
        next: { revalidate: 86400 },
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }

    if (!res.ok && res.status !== 206) return null;

    const ct = res.headers.get("content-type") || "";
    if (ct.includes("text/html")) return null;

    const buf = Buffer.from(await res.arrayBuffer());
    const str = buf.toString("latin1");
    const m = str.match(/(20[0-3]\d):(0[1-9]|1[0-2]):([0-2]\d|3[01]) (\d{2}:\d{2}:\d{2})/);
    if (!m) return null;
    // Sanity: must be in batch era (not a default/corrupt EXIF date)
    const exifYear = parseInt(m[1], 10);
    if (exifYear < 2020 || exifYear > 2026) return null;
    return `${m[1]}:${m[2]}:${m[3]} ${m[4]}`;
  } catch {
    return null;
  }
}

/**
 * For iPhone MOV files (IMG_XXXX.MOV) that have no date in their filename,
 * fetch the first 256KB from Google Drive and parse the recording date from
 * the QuickTime/MP4 'mvhd' (movie header) atom. The mvhd stores creation
 * time as seconds since 1904-01-01 (Mac/QuickTime epoch), written by the
 * camera at the moment of recording — unaffected by upload time.
 *
 * Uses drive.usercontent.google.com which handles the auth redirect cleanly
 * and returns the real file bytes (not a confirmation HTML page).
 */
async function fetchVideoDateFromFile(fileId: string): Promise<Date | null> {
  try {
    // This URL handles public-file auth better than drive.google.com/uc
    const url = `https://drive.usercontent.google.com/download?id=${fileId}&export=download&confirm=t`;

    // 4-second timeout per video — if Drive is slow, skip rather than stall the page
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);

    let res: Response;
    try {
      res = await fetch(url, {
        headers: { Range: "bytes=0-262143" }, // 256 KB
        next: { revalidate: 86400 },
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }

    if (!res.ok && res.status !== 206) return null;

    // If Google returned an HTML page (virus/size warning) bail out
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("text/html")) return null;

    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 20) return null;

    // Scan for 'mvhd' bytes: 0x6d 0x76 0x68 0x64
    let idx = -1;
    for (let i = 0; i < buf.length - 16; i++) {
      if (buf[i] === 0x6d && buf[i+1] === 0x76 && buf[i+2] === 0x68 && buf[i+3] === 0x64) {
        idx = i;
        break;
      }
    }
    if (idx === -1) return null;

    // Layout after 'mvhd': version(1) flags(3) creation_time(4 or 8)
    const version = buf[idx + 4];
    let secSince1904: number;

    if (version === 1) {
      // 64-bit timestamp — split into hi/lo to avoid BigInt
      const hi = buf.readUInt32BE(idx + 8);
      const lo = buf.readUInt32BE(idx + 12);
      secSince1904 = hi * 4294967296 + lo;
    } else {
      // 32-bit timestamp
      secSince1904 = buf.readUInt32BE(idx + 8);
    }

    // Mac epoch (1904-01-01) → Unix epoch (1970-01-01): subtract 2082844800s
    const unixSec = secSince1904 - 2082844800;
    if (unixSec <= 0) return null;

    const date = new Date(unixSec * 1000);
    if (isNaN(date.getTime())) return null;

    // Sanity check: must be in batch era (2020–2026)
    const year = date.getFullYear();
    if (year < 2020 || year > 2026) return null;

    return date;
  } catch {
    return null;
  }
}

/**
 * Checks if a Drive imageMediaMetadata.time value is just the upload date
 * (Drive sets it equal to createdTime when no real EXIF is found).
 * If they're within 2 hours of each other, treat it as unreliable.
 */
function isExifTimeReliable(exifTime: string, createdTime: string): boolean {
  const exifIso = exifTime.replace(/^(\d{4}):(\d{2}):(\d{2})/, "$1-$2-$3");
  const exifMs = new Date(exifIso).getTime();
  const uploadMs = new Date(createdTime).getTime();
  if (isNaN(exifMs) || isNaN(uploadMs)) return false;
  // If within 2 hours → Drive just echoed the upload date, not real EXIF
  return Math.abs(exifMs - uploadMs) > 2 * 60 * 60 * 1000;
}

/**
 * Attempts to extract the real taken date from a file.
 * Returns { date: Date, source: string } if found, or null if no real date exists.
 * This is the single source of truth — both extractTakenYear and extractTakenDate use it.
 */
function extractRealDate(file: any): { date: Date; source: string } | null {
  const isVideo = String(file.mimeType || "").startsWith("video/");

  // 1. Filename date — most reliable for Android/WhatsApp files (date is in the filename at capture time)
  if (file.name) {
    const d = dateFromFilename(String(file.name));
    if (d) return { date: d, source: "filename" };
  }
  // 2. EXIF from Apps Script — only trust it if it's not the same as the upload date
  if (file.imageMediaMetadata?.time && isExifTimeReliable(file.imageMediaMetadata.time, file.createdTime)) {
    const iso = String(file.imageMediaMetadata.time).replace(/^(\d{4}):(\d{2}):(\d{2})/, "$1-$2-$3");
    const d = new Date(iso);
    if (!isNaN(d.getTime())) return { date: d, source: "exif-drive" };
  }
  // 3. Server-side EXIF bytes (for iPhone images with no date in filename)
  if (!isVideo && file._exifDate) {
    const iso = String(file._exifDate).replace(/^(\d{4}):(\d{2}):(\d{2})/, "$1-$2-$3");
    const d = new Date(iso);
    if (!isNaN(d.getTime())) return { date: d, source: "exif-bytes" };
  }
  // 4. Video mvhd atom date (iPhone .MOV / .MP4 — recording date from container header)
  if (isVideo && file._videoDate) {
    const d = new Date(file._videoDate);
    if (!isNaN(d.getTime())) return { date: d, source: "video-mvhd" };
  }
  // No real date found — do NOT fall back to upload date
  return null;
}

function extractTakenYear(file: any): string {
  const result = extractRealDate(file);
  if (result) return String(result.date.getFullYear());
  // No real date — mark as Unknown instead of using misleading upload date
  return "Unknown";
}

function extractTakenDate(file: any): string {
  const result = extractRealDate(file);
  if (result) return fmt(result.date);
  // No real date — return empty string instead of misleading upload date
  return "";
}

/** ISO date string used for sorting (always available, uses upload date as fallback) */
function extractSortDate(file: any): string {
  const result = extractRealDate(file);
  if (result) return result.date.toISOString();
  // For sorting purposes only, use upload date (never displayed)
  return new Date(file.createdTime).toISOString();
}

export async function getMemoriesInternal(): Promise<Memory[]> {
  const SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;

  if (!SCRIPT_URL || SCRIPT_URL.includes("AKfycb...")) {
    console.warn("Memories Lib: SCRIPT_URL is missing or placeholder.");
    return [];
  }

  try {
    const response = await fetch(SCRIPT_URL, {
      cache: "no-store",
      headers: { "Accept": "application/json" },
    });

    if (!response.ok) {
      console.error(`Memories Lib Error: Fetch failed with status ${response.status}`);
      return [];
    }

    const text = await response.text();

    // Log first 300 chars so we can see what the script is returning
    if (text.trimStart().startsWith("<")) {
      console.error("Memories Lib: Script returned HTML instead of JSON. Deployment is broken.");
      console.error("Script response preview:", text.slice(0, 300));
      return [];
    }

    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      console.error("Memories Lib: Script returned invalid JSON:", text.slice(0, 300));
      return [];
    }

    if (!Array.isArray(data)) {
      console.warn("Memories Lib Error: Google Script returned non-array data.");
      return [];
    }

    // Filter out folders and other non-media files
    data = data.filter((f: any) => {
      const mime = String(f.mimeType || "");
      return mime.startsWith("image/") || mime.startsWith("video/");
    });

    // Deduplicate by ID before sorting
    const seen = new Set<string>();
    const uniqueData = data.filter((f: any) => {
      if (seen.has(f.id)) return false;
      seen.add(f.id);
      return true;
    });

    const sortedData = uniqueData
      .sort((a: any, b: any) =>
        new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime()
      )
      .slice(0, 120);

    // Files that need raw-byte date extraction:
    // - No date embedded in the filename (Android/WhatsApp datestamp style)
    // - No reliable EXIF from Apps Script (either missing, or same as upload date → Drive echoed createdTime)
    // UUID-named files are now included — they may still have real EXIF in raw bytes.
    // Year validation (2020-2026) inside the extraction functions discards any bad results.
    const needsDate = sortedData.filter((f: any) => {
      if (dateFromFilename(String(f.name || ""))) return false; // filename date → skip
      if (
        f.imageMediaMetadata?.time &&
        isExifTimeReliable(String(f.imageMediaMetadata.time), String(f.createdTime))
      ) return false; // reliable Apps Script EXIF → skip
      return true;
    });
    const needsExif  = needsDate.filter((f: any) => !String(f.mimeType || "").startsWith("video/"));
    const needsVideo = needsDate.filter((f: any) =>  String(f.mimeType || "").startsWith("video/"));

    // Helper: run async tasks with max concurrency to avoid flooding connections
    const withConcurrency = async <T,>(
      items: any[],
      limit: number,
      fn: (item: any) => Promise<T>
    ): Promise<T[]> => {
      const results: T[] = [];
      for (let i = 0; i < items.length; i += limit) {
        const batch = items.slice(i, i + limit);
        const batchResults = await Promise.all(batch.map(fn));
        results.push(...batchResults);
      }
      return results;
    };

    // Fetch image EXIF (ASCII date in first 64KB) — max 8 at a time
    const exifMap = new Map<string, string>();
    if (needsExif.length > 0) {
      const results = await withConcurrency(
        needsExif,
        8,
        async (f: any) => ({ id: f.id, exifDate: await fetchExifDateFromFile(f.id) })
      );
      results.forEach((r) => { if (r.exifDate) exifMap.set(r.id, r.exifDate); });
    }

    // Fetch video mvhd atom date — max 5 at a time (videos are large, limit bandwidth)
    const videoDateMap = new Map<string, string>();
    if (needsVideo.length > 0) {
      const results = await withConcurrency(
        needsVideo,
        5,
        async (f: any) => ({ id: f.id, videoDate: await fetchVideoDateFromFile(f.id) })
      );
      results.forEach((r) => {
        if (r.videoDate) videoDateMap.set(r.id, r.videoDate.toISOString());
      });
    }

    return sortedData.map((file: any) => {
      const enriched = {
        ...file,
        ...(exifMap.has(file.id)      ? { _exifDate:  exifMap.get(file.id) }      : {}),
        ...(videoDateMap.has(file.id) ? { _videoDate: videoDateMap.get(file.id) } : {}),
      };

      const isVideo = String(file.mimeType || "").startsWith("video/");
      return {
        id: file.id,
        src: isVideo ? `https://drive.google.com/file/d/${file.id}/preview` : `/api/memories/image?id=${file.id}`,
        date: extractTakenDate(enriched),
        sortDate: extractSortDate(enriched),
        takenYear: extractTakenYear(enriched),
        fullRes: `https://drive.google.com/uc?export=view&id=${file.id}`,
        type: isVideo ? "video" as const : "image" as const,
        mimeType: file.mimeType,
      };
    });
  } catch (error) {
    console.error("Memories Lib Exception:", error);
    return [];
  }
}
