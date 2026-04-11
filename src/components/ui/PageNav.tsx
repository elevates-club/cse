"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth/AuthContext";
import { useState } from "react";
import LoginModal from "@/components/auth/LoginModal";
import UploadModal from "@/components/sections/UploadModal";

const NAV_LINKS = [
  { href: "/archive", label: "Archive" },
  { href: "/journey", label: "Journey" },
  { href: "/videos", label: "Videos" },
  { href: "/confessions", label: "Confessions" },
  { href: "/people", label: "People" },
];

export default function PageNav({ activePage }: { activePage?: string }) {
  const { isAuthenticated, logout, user } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 px-5 md:px-10 py-4 flex justify-between items-center bg-primary/80 backdrop-blur-md border-b border-white/5">
        <Link href="/" className="group flex items-center gap-3">
          <div className="w-7 h-7 rounded-full border border-gold/30 flex items-center justify-center group-hover:border-gold transition-colors">
            <span className="text-[10px] text-gold">←</span>
          </div>
          <h3 className="font-display text-lg md:text-xl tracking-tighter group-hover:text-gold transition-colors">
            CSE&apos;22-26
          </h3>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-5 lg:gap-7">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-[9px] uppercase tracking-widest font-body transition-colors ${
                activePage === l.href
                  ? "text-gold"
                  : "text-white/40 hover:text-white"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <span className="text-white/10">|</span>
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="text-[9px] uppercase tracking-widest text-gold font-body hidden lg:block">
                {user?.name.split(" ")[0]}
              </span>
              <button
                onClick={() => setIsUploadOpen(true)}
                className="px-4 py-2 bg-white text-primary text-[10px] font-bold rounded-full hover:bg-gold transition-all"
              >
                Upload
              </button>
              <button
                onClick={logout}
                className="text-[9px] uppercase tracking-widest text-white/40 hover:text-white font-body transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsLoginOpen(true)}
              className="px-4 py-2 border border-white/10 text-white text-[10px] font-bold rounded-full hover:bg-white hover:text-primary transition-all"
            >
              Sign In
            </button>
          )}
        </div>

        {/* Mobile: hamburger */}
        <div className="flex md:hidden items-center gap-3">
          {isAuthenticated ? (
            <button
              onClick={() => setIsUploadOpen(true)}
              className="px-3 py-1.5 bg-white text-primary text-[10px] font-bold rounded-full hover:bg-gold transition-all"
            >
              Upload
            </button>
          ) : (
            <button
              onClick={() => setIsLoginOpen(true)}
              className="px-3 py-1.5 border border-white/10 text-white text-[10px] font-bold rounded-full hover:bg-white hover:text-primary transition-all"
            >
              Sign In
            </button>
          )}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex flex-col gap-1 p-1"
            aria-label="Menu"
          >
            <span className={`block w-5 h-px bg-white/60 transition-all origin-center ${menuOpen ? "rotate-45 translate-y-[5px]" : ""}`} />
            <span className={`block w-5 h-px bg-white/60 transition-all ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block w-5 h-px bg-white/60 transition-all origin-center ${menuOpen ? "-rotate-45 -translate-y-[5px]" : ""}`} />
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 pt-16" onClick={() => setMenuOpen(false)}>
          <div
            className="absolute right-0 top-16 w-56 bg-surface/95 backdrop-blur-xl border border-white/10 rounded-bl-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className={`block px-6 py-4 text-[10px] uppercase tracking-widest font-body border-b border-white/5 last:border-0 transition-colors ${
                  activePage === l.href
                    ? "text-gold bg-gold/5"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                }`}
              >
                {l.label}
              </Link>
            ))}
            {isAuthenticated && (
              <button
                onClick={() => { logout(); setMenuOpen(false); }}
                className="w-full text-left px-6 py-4 text-[10px] uppercase tracking-widest font-body text-white/30 hover:text-white hover:bg-white/5 transition-colors"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      )}

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      <UploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
    </>
  );
}
