"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PageNav from "@/components/ui/PageNav";

interface Confession {
  id: string;
  text: string;
  timestamp: string;
  isLocal?: boolean;
}

type SortOrder = "newest" | "oldest" | "random";

function formatTimeAgo(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / 86400000);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);
  if (years > 0) return `${years}y ago`;
  if (months > 0) return `${months}mo ago`;
  if (days > 0) return `${days}d ago`;
  return "just now";
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const CARD_ACCENTS = [
  "from-accent/10 to-transparent border-accent/20",
  "from-gold/10 to-transparent border-gold/20",
  "from-white/5 to-transparent border-white/10",
  "from-purple-500/10 to-transparent border-purple-500/20",
  "from-accent/5 to-transparent border-accent/10",
  "from-gold/5 to-transparent border-gold/10",
];

export default function ConfessionsPage() {
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [sort, setSort] = useState<SortOrder>("newest");
  const [showForm, setShowForm] = useState(false);
  const [formText, setFormText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const loadConfessions = async () => {
      const res = await fetch("/data/confessions.json");
      const base: Confession[] = await res.json();
      const local = JSON.parse(localStorage.getItem("cse-confessions") || "[]") as Confession[];
      setConfessions([...local, ...base]);
      setLoaded(true);
    };
    loadConfessions();
  }, []);

  const sorted = useCallback(() => {
    if (sort === "oldest") return [...confessions].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    if (sort === "random") return shuffleArray(confessions);
    return [...confessions].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [confessions, sort]);

  const handleSubmit = () => {
    if (!formText.trim()) return;
    const newConf: Confession = {
      id: `local-${Date.now()}`,
      text: formText.trim(),
      timestamp: new Date().toISOString(),
      isLocal: true,
    };
    const existing = JSON.parse(localStorage.getItem("cse-confessions") || "[]");
    localStorage.setItem("cse-confessions", JSON.stringify([newConf, ...existing]));
    setConfessions((prev) => [newConf, ...prev]);
    setFormText("");
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setShowForm(false);
    }, 2500);
  };

  const displayList = sorted();

  return (
    <main className="min-h-screen bg-primary px-4 md:px-8 pb-24 overflow-x-hidden relative selection:bg-accent/30">
      {/* Ambient */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[400px] h-[400px] bg-gold/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40 pointer-events-none" />

      <PageNav activePage="/confessions" />

      {/* Hero */}
      <div className="pt-32 pb-12 text-center relative z-10">
        <motion.span
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-gold font-body text-[9px] uppercase tracking-[0.7em] mb-3 block"
        >
          Anonymous · Class of 2022–26
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-4xl md:text-6xl lg:text-7xl bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent mb-4"
        >
          Wall of Whispers
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="text-muted font-body text-sm md:text-base max-w-md mx-auto opacity-70 leading-relaxed"
        >
          The things we never said out loud — until now.
        </motion.p>

        {/* Toolbar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="flex items-center justify-center gap-3 mt-8 flex-wrap"
        >
          {(["newest", "oldest", "random"] as SortOrder[]).map((s) => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className={`px-4 py-2 rounded-full text-[9px] uppercase tracking-widest font-body transition-all ${
                sort === s
                  ? "bg-white text-primary font-bold"
                  : "border border-white/10 text-white/40 hover:text-white hover:border-white/30"
              }`}
            >
              {s === "newest" ? "Most Recent" : s === "oldest" ? "Oldest" : "Shuffle"}
            </button>
          ))}
          <span className="text-white/10">·</span>
          <button
            onClick={() => setShowForm(true)}
            className="px-5 py-2 bg-accent/20 border border-accent/30 text-accent rounded-full text-[9px] uppercase tracking-widest font-body hover:bg-accent hover:text-white transition-all"
          >
            + Add Yours
          </button>
        </motion.div>
      </div>

      {/* Submit Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center px-4"
            onClick={() => setShowForm(false)}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-lg bg-surface/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowForm(false)}
                className="absolute top-5 right-5 text-white/30 hover:text-white text-xl transition-colors"
              >
                ×
              </button>
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-8"
                >
                  <div className="text-4xl mb-4">✦</div>
                  <h3 className="font-display text-2xl text-gold mb-2">Added to the Wall</h3>
                  <p className="text-muted font-body text-sm">Your whisper has joined the others.</p>
                </motion.div>
              ) : (
                <>
                  <h3 className="font-display text-2xl mb-1">Leave a Whisper</h3>
                  <p className="text-muted/60 font-body text-xs mb-6 uppercase tracking-widest">Anonymous · Only you can see this on your device</p>
                  <textarea
                    value={formText}
                    onChange={(e) => setFormText(e.target.value)}
                    maxLength={400}
                    rows={5}
                    placeholder="Something you never said out loud..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white/90 font-body text-sm resize-none focus:outline-none focus:border-accent/40 placeholder:text-white/20 transition-colors"
                  />
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-white/20 text-[10px] font-body">{formText.length}/400</span>
                    <button
                      onClick={handleSubmit}
                      disabled={!formText.trim()}
                      className="px-6 py-2.5 bg-white text-primary text-[11px] font-bold rounded-full hover:bg-gold transition-all disabled:opacity-30 disabled:cursor-not-allowed uppercase tracking-widest"
                    >
                      Submit
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Count */}
      {loaded && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-white/20 font-body text-[10px] uppercase tracking-widest mb-10 relative z-10"
        >
          {confessions.length} whispers on the wall
        </motion.p>
      )}

      {/* Masonry Grid */}
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-0">
          <AnimatePresence mode="wait">
            {displayList.map((c, i) => {
              const accent = CARD_ACCENTS[i % CARD_ACCENTS.length];
              return (
                <motion.div
                  key={`${sort}-${c.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: Math.min(i * 0.04, 0.6), duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="break-inside-avoid mb-4"
                >
                  <div
                    className={`relative bg-gradient-to-br ${accent} backdrop-blur-sm border rounded-2xl p-6 group hover:border-white/20 transition-all duration-300`}
                  >
                    {/* Subtle quote mark */}
                    <span className="absolute top-4 left-5 text-5xl text-white/[0.04] font-display leading-none pointer-events-none select-none">
                      ❝
                    </span>

                    {c.isLocal && (
                      <span className="inline-block mb-3 px-2 py-0.5 rounded-full text-[8px] uppercase tracking-widest font-body bg-accent/10 text-accent border border-accent/20">
                        you
                      </span>
                    )}

                    <p className="text-white/80 font-body text-[13px] md:text-sm leading-relaxed pt-2">
                      {c.text}
                    </p>

                    <div className="mt-4 flex items-center gap-2">
                      <div className="w-4 h-px bg-white/10" />
                      <span className="text-white/20 font-body text-[9px] uppercase tracking-widest">
                        {formatTimeAgo(c.timestamp)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {!loaded && (
          <div className="flex flex-col items-center gap-3 py-24 text-white/20">
            <div className="w-5 h-5 border border-white/10 border-t-white/40 rounded-full animate-spin" />
            <span className="font-body text-[10px] uppercase tracking-widest">Loading</span>
          </div>
        )}
      </div>

      {/* Footer line */}
      <div className="mt-20 text-center relative z-10">
        <div className="w-px h-10 bg-gradient-to-b from-gold/30 to-transparent mx-auto mb-4" />
        <p className="text-white/10 font-body text-[9px] uppercase tracking-widest">
          All whispers are anonymous · Speak freely
        </p>
      </div>
    </main>
  );
}
