"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import PageNav from "@/components/ui/PageNav";

interface Student {
  id: string;
  name: string;
  regNo: string;
  photo: string;
  quote?: string;
  instagram?: string;
}

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function StudentCard({ student, index }: { student: Student; index: number }) {
  const initials = student.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const hue = (student.name.charCodeAt(0) * 37 + student.name.charCodeAt(1 % student.name.length) * 13) % 360;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.8), duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="group relative"
    >
      <div className="relative bg-surface/40 backdrop-blur-sm border border-white/8 rounded-2xl p-5 hover:border-white/20 hover:-translate-y-1 transition-all duration-300 hover:shadow-[0_20px_60px_-10px_rgba(0,0,0,0.5)] flex flex-col items-center text-center gap-3">
        {/* Avatar */}
        <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
          {student.photo && !student.photo.includes("/images/students/") ? (
            <Image src={student.photo} alt={student.name} fill className="object-cover" />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-white/80 font-display text-xl font-light"
              style={{
                background: `linear-gradient(135deg, hsl(${hue},30%,20%), hsl(${hue},40%,15%))`,
                border: `1px solid hsl(${hue},50%,30%)`,
              }}
            >
              {initials}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <h3 className="font-display text-base leading-tight text-white group-hover:text-gold transition-colors">
            {student.name}
          </h3>
          <p className="text-white/30 font-body text-[10px] uppercase tracking-wider mt-0.5">
            {student.regNo}
          </p>
        </div>

        {/* Quote */}
        {student.quote && (
          <p className="text-white/40 font-handwriting text-[13px] leading-relaxed border-t border-white/8 pt-3 w-full">
            &ldquo;{student.quote}&rdquo;
          </p>
        )}

        {/* Instagram */}
        {student.instagram && (
          <a
            href={`https://instagram.com/${student.instagram.replace("@", "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/20 hover:text-white/60 font-body text-[10px] transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            {student.instagram}
          </a>
        )}
      </div>
    </motion.div>
  );
}

export default function PeoplePage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [letterFilter, setLetterFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/data/students.json")
      .then((r) => r.json())
      .then((data: Student[]) => {
        setStudents(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const usedLetters = useMemo(
    () => new Set(students.map((s) => s.name[0].toUpperCase())),
    [students]
  );

  const filtered = useMemo(() => {
    let list = [...students].sort((a, b) => a.name.localeCompare(b.name));
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.regNo.toLowerCase().includes(q)
      );
    }
    if (letterFilter !== "all") {
      list = list.filter((s) => s.name[0].toUpperCase() === letterFilter);
    }
    return list;
  }, [students, search, letterFilter]);

  return (
    <main className="min-h-screen bg-primary px-4 md:px-8 pb-24 overflow-x-hidden relative selection:bg-gold/30">
      {/* Ambient */}
      <div className="fixed top-0 left-0 w-[600px] h-[600px] bg-gold/5 rounded-full blur-[160px] pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40 pointer-events-none" />

      <PageNav activePage="/people" />

      {/* Hero */}
      <div className="pt-32 pb-10 text-center relative z-10">
        <motion.span
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-gold font-body text-[9px] uppercase tracking-[0.7em] mb-3 block"
        >
          The Batch · CSE 2022–26
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-4xl md:text-6xl lg:text-7xl bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent mb-4"
        >
          The People
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-muted font-body text-sm md:text-base max-w-md mx-auto opacity-70 leading-relaxed"
        >
          {students.length > 0 ? `${students.length} people who made it worth it.` : "The faces behind four years."}
        </motion.p>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 flex justify-center px-4"
        >
          <div className="relative w-full max-w-sm">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setLetterFilter("all"); }}
              placeholder="Search by name or reg no..."
              className="w-full bg-white/5 border border-white/10 rounded-full pl-10 pr-5 py-3 text-white/80 font-body text-sm focus:outline-none focus:border-white/30 placeholder:text-white/20 transition-colors"
            />
          </div>
        </motion.div>

        {/* Alphabet filter */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-5 flex flex-wrap justify-center gap-1 px-4 max-w-3xl mx-auto"
        >
          <button
            onClick={() => { setLetterFilter("all"); setSearch(""); }}
            className={`px-3 py-1.5 rounded-lg text-[9px] font-body tracking-widest uppercase transition-all ${
              letterFilter === "all"
                ? "bg-white text-primary font-bold"
                : "text-white/30 hover:text-white/60"
            }`}
          >
            All
          </button>
          {ALPHABET.map((l) => (
            <button
              key={l}
              onClick={() => { setLetterFilter(l); setSearch(""); }}
              disabled={!usedLetters.has(l)}
              className={`w-7 h-7 rounded-lg text-[10px] font-body tracking-widest transition-all ${
                letterFilter === l
                  ? "bg-gold text-primary font-bold"
                  : usedLetters.has(l)
                  ? "text-white/40 hover:text-white hover:bg-white/10"
                  : "text-white/10 cursor-not-allowed"
              }`}
            >
              {l}
            </button>
          ))}
        </motion.div>
      </div>

      {/* Count */}
      {!loading && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-white/20 font-body text-[10px] uppercase tracking-widest mb-10 relative z-10"
        >
          {filtered.length} {filtered.length === 1 ? "person" : "people"}
          {letterFilter !== "all" ? ` · ${letterFilter}` : ""}
          {search ? ` · "${search}"` : ""}
        </motion.p>
      )}

      {/* Grid */}
      <div className="max-w-5xl mx-auto relative z-10">
        {loading && (
          <div className="flex flex-col items-center gap-3 py-24 text-white/20">
            <div className="w-5 h-5 border border-white/10 border-t-white/40 rounded-full animate-spin" />
            <span className="font-body text-[10px] uppercase tracking-widest">Loading</span>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24 text-white/30"
          >
            <p className="font-display text-2xl mb-2">No results</p>
            <p className="font-body text-sm">Try a different name or clear the filter.</p>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={search + letterFilter}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
          >
            {filtered.map((student, i) => (
              <StudentCard key={student.id} student={student} index={i} />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="mt-20 text-center relative z-10">
        <div className="w-px h-10 bg-gradient-to-b from-gold/30 to-transparent mx-auto mb-4" />
        <p className="text-white/10 font-body text-[9px] uppercase tracking-widest">
          CSE Batch 2022–26 · {students.length} Strong
        </p>
      </div>
    </main>
  );
}
