import React from "react";
import ArchiveGrid from "@/components/sections/ArchiveGrid";
import Link from "next/link";
import { getMemoriesInternal } from "@/lib/memories";
import fs from "fs";
import path from "path";

async function getQuotes() {
  try {
    const filePath = path.join(process.cwd(), "public", "data", "quotes.json");
    const fileContent = fs.readFileSync(filePath, "utf8");
    return JSON.parse(fileContent);
  } catch (error) {
    console.error("Archive Page: Failed to read quotes.json from filesystem", error);
    return [];
  }
}

export default async function ArchivePage() {
  // Fetch data in parallel on the server
  const [memories, quotes] = await Promise.all([
    getMemoriesInternal(),
    getQuotes()
  ]);

  // Perform shuffling and rotation on the server to prevent hydration errors
  const shuffledQuotes = [...quotes].sort(() => 0.5 - Math.random());
  const items = memories.map((memory: any, i: number) => ({
    memory,
    quote: shuffledQuotes[i % shuffledQuotes.length],
    rotation: Math.random() * 20 - 10,
  }));

  return (
    <main className="min-h-screen bg-[#0a0a0a] py-32 px-6 overflow-x-hidden relative selection:bg-gold/30">
      {/* Texture Overlays */}
      <div className="fixed inset-0 bg-[url('https://www.transparenttextures.com/patterns/micro-carbon.png')] opacity-20 pointer-events-none z-10" />
      <div className="fixed inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/60 pointer-events-none z-10" />

      {/* Header */}
      <div className="fixed top-0 left-0 w-full z-50 p-6 md:p-10 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm">
        <Link href="/" className="group flex items-center gap-3">
          <div className="w-8 h-8 rounded-full border border-gold/30 flex items-center justify-center group-hover:border-gold transition-colors">
            <span className="text-[10px] text-gold">←</span>
          </div>
          <h3 className="font-display text-xl tracking-tighter group-hover:text-gold transition-colors">CSE&apos;22-26</h3>
        </Link>
        <div className="flex items-center gap-8">
           <span className="text-[9px] md:text-[10px] uppercase tracking-[0.5em] text-muted hidden md:block">
            The Digital Scrapbook • Memories in Miniatures
          </span>
        </div>
      </div>

      <ArchiveGrid items={items} />

       {/* Ambient Subtle Return */}
       <div className="mt-32 text-center pb-24 relative z-20">
         <div className="w-0.5 h-16 bg-gradient-to-b from-gold/40 to-transparent mx-auto mb-8" />
         <Link href="/" className="text-[10px] uppercase tracking-widest text-white/30 hover:text-white transition-all hover:tracking-[0.6em]">
            End of Collection • Return to Sanctuary
         </Link>
      </div>
    </main>
  );
}
