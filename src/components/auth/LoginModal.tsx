"use client";

import React, { useState } from "react";
import { useAuth } from "./AuthContext";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [regNo, setRegNo] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const success = await login(regNo);
    if (success) {
      onClose();
    } else {
      setError("Invalid Registration Number. Access Restricted to Class Students.");
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md glassmorphism p-8 rounded-3xl"
        >
          <div className="text-center mb-8">
            <h2 className="font-display text-3xl text-gold mb-2">Student Verification</h2>
            <p className="text-muted text-sm px-4">
              Enter your University Registration Number to unlock upload features.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="regNo" className="block text-xs uppercase tracking-widest text-muted mb-2 font-body">
                Registration Number
              </label>
              <input
                id="regNo"
                type="text"
                value={regNo}
                onChange={(e) => setRegNo(e.target.value)}
                placeholder="e.g., CSE-2022-26-001"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-accent/50 transition-colors"
                required
              />
              {error && <p className="text-red-400 text-xs mt-2 italic">{error}</p>}
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-accent hover:bg-accent/80 text-white font-medium rounded-xl transition-all disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Sign In"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 bg-white/5 hover:bg-white/10 text-white/50 font-medium rounded-xl transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
          
          <p className="mt-8 text-[10px] text-center text-muted uppercase tracking-[0.2em] opacity-40">
            Authorized Personnel Only
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
