"use client";

import { motion } from "framer-motion";
import { ScrollText, Trophy, CircleCheck, Circle, Flame } from "lucide-react";
import { betoCarreroPromise } from "@/lib/data/seed";

export function PromiseCard() {
  const promise = betoCarreroPromise;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="promise-card p-6 sm:p-8 relative"
    >
      {/* Decorative corner flourishes */}
      <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-amber-700/40 rounded-tl-md" />
      <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-amber-700/40 rounded-tr-md" />
      <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-amber-700/40 rounded-bl-md" />
      <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-amber-700/40 rounded-br-md" />

      {/* Header */}
      <div className="relative z-10 text-center mb-6">
        <div className="flex justify-center mb-3">
          <motion.div
            animate={{ rotate: [0, -5, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 4 }}
          >
            <ScrollText className="h-8 w-8 text-amber-500/80" />
          </motion.div>
        </div>
        <h3
          className="font-serif text-xl sm:text-2xl font-bold tracking-wide"
          style={{ color: "hsl(32 70% 65%)" }}
        >
          A Promessa™
        </h3>
        <p className="text-xs mt-1.5" style={{ color: "hsl(32 30% 50%)" }}>
          Beto Carrero World — Firmada em {promise.date}, às {promise.time}
        </p>
      </div>

      {/* Challenge statement */}
      <div className="relative z-10 mb-6">
        <div
          className="rounded-xl p-4 text-center"
          style={{
            background: "hsl(32 20% 10% / 0.5)",
            border: "1px solid hsl(32 30% 20% / 0.5)",
          }}
        >
          <p className="text-sm font-medium" style={{ color: "hsl(40 30% 80%)" }}>
            O <span className="text-amber-400 font-bold">Pedro</span> se compromete a:
          </p>
          <p
            className="font-serif text-base sm:text-lg font-semibold mt-2 leading-snug"
            style={{ color: "hsl(32 60% 70%)" }}
          >
            {promise.challenge}
          </p>
        </div>
      </div>

      {/* Conditions */}
      <div className="relative z-10 mb-6">
        <p
          className="text-xs font-semibold uppercase tracking-widest mb-3"
          style={{ color: "hsl(32 40% 50%)" }}
        >
          Condições
        </p>
        <div className="space-y-2.5">
          {promise.conditions.map((condition, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + i * 0.1 }}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5"
              style={{
                background: "hsl(32 15% 10% / 0.4)",
                border: "1px solid hsl(32 20% 18% / 0.3)",
              }}
            >
              <Circle
                className="h-4 w-4 flex-shrink-0"
                style={{ color: "hsl(32 50% 45%)" }}
              />
              <span className="text-sm" style={{ color: "hsl(40 20% 75%)" }}>
                {condition}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div
        className="relative z-10 border-t my-5"
        style={{ borderColor: "hsl(32 30% 20% / 0.4)" }}
      />

      {/* Reward */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="relative z-10"
      >
        <div className="flex items-start gap-3">
          <div
            className="rounded-full p-2 flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, hsl(32 60% 25%), hsl(32 50% 18%))",
              boxShadow: "0 0 20px hsl(32 60% 30% / 0.3)",
            }}
          >
            <Trophy className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-1"
              style={{ color: "hsl(32 40% 50%)" }}
            >
              Se cumprido, a recompensa
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "hsl(40 25% 78%)" }}>
              {promise.reward}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Wax seal decoration */}
      <div className="absolute -bottom-2 -right-2 opacity-20">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{
            background:
              "radial-gradient(circle, hsl(0 60% 35%) 0%, hsl(0 50% 25%) 70%, transparent 100%)",
          }}
        >
          <Flame className="h-6 w-6 text-red-300/80" />
        </div>
      </div>
    </motion.div>
  );
}
