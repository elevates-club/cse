import React from "react";
import ArchiveGrid from "@/components/sections/ArchiveGrid";
import Link from "next/link";
import { getMemoriesInternal } from "@/lib/memories";
import PageNav from "@/components/ui/PageNav";

export const dynamic = "force-dynamic";

export default async function ArchivePage() {
  const memories = await getMemoriesInternal();

  const items = memories.map((memory, i) => ({
    memory,
    rotation: (i % 2 === 0 ? 1 : -1) * ((i % 5) + 1) * 1.5,
  }));

  return (
    <main className="min-h-screen bg-primary py-32 px-4 md:px-6 overflow-x-hidden relative selection:bg-gold/30">
      {/* Texture */}
      <div className="fixed inset-0 bg-[url('https://www.transparenttextures.com/patterns/micro-carbon.png')] opacity-20 pointer-events-none z-10" />
      <div className="fixed inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/60 pointer-events-none z-10" />

      <PageNav activePage="/archive" />

      <ArchiveGrid items={items} />

      {/* Footer */}
      <div className="mt-24 text-center pb-16 relative z-20">
        <div className="w-px h-12 bg-gradient-to-b from-gold/30 to-transparent mx-auto mb-6" />
        <Link
          href="/"
          className="text-[9px] uppercase tracking-widest text-white/20 hover:text-white/60 transition-all font-body"
        >
          End of Collection · Return to Sanctuary
        </Link>
      </div>
    </main>
  );
}
