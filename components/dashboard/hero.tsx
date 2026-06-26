"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Heart, Compass, ChevronRight } from "lucide-react";

export function DashboardHero({ trips }: { trips: any[] }) {
  const totalTrips = trips.length;
  const plannedTrips = trips.filter((t) => t.status === "planned" || t.status === "active").length;
  const countries = new Set(trips.map((t) => t.country_code).filter(Boolean)).size;

  // Next upcoming trip
  const now = new Date();
  const upcoming = trips
    .filter((t) => new Date(t.start_date + "T00:00:00") > now && t.status !== "cancelled")
    .sort((a, b) => a.start_date.localeCompare(b.start_date))[0];

  return (
    <div className="relative overflow-hidden rounded-3xl mb-8">
      {/* Background gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, hsl(220 20% 8%) 0%, hsl(32 20% 10%) 50%, hsl(220 25% 8%) 100%)",
        }}
      />

      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-accent/20"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.3,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 px-6 sm:px-10 py-10 sm:py-14">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-10">
          {/* Avatar pair */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex items-end -space-x-4"
          >
            <div className="avatar-ring">
              <Image
                src="/avatars/alice-v2.png"
                alt="Alice"
                width={72}
                height={72}
                className="rounded-full"
                priority
              />
            </div>
            <div className="avatar-ring relative">
              <Image
                src="/avatars/pedro-v2.png"
                alt="Pedro"
                width={72}
                height={72}
                className="rounded-full"
                priority
              />
              <motion.div
                className="absolute -top-1 -right-1"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Heart className="h-4 w-4 text-red-400 fill-red-400" />
              </motion.div>
            </div>
          </motion.div>

          {/* Text */}
          <div className="flex-1">
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold"
            >
              <span className="text-text">Alice </span>
              <span className="text-accent">&</span>
              <span className="text-text"> Pedro</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="text-text-muted text-sm sm:text-base mt-2 max-w-lg"
            >
              Nossas aventuras pelo mundo — de São Paulo ao Atacama, dos Dolomites a Istanbul.
            </motion.p>
          </div>

          {/* Quick stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="hidden md:flex items-center gap-6"
          >
            <div className="text-center">
              <div className="text-2xl font-bold font-mono text-accent">{totalTrips}</div>
              <div className="text-[10px] uppercase tracking-widest text-text-subtle mt-0.5">
                Aventuras
              </div>
            </div>
            <div
              className="w-px h-10"
              style={{ background: "hsl(220 12% 20%)" }}
            />
            <div className="text-center">
              <div className="text-2xl font-bold font-mono text-accent">{countries}</div>
              <div className="text-[10px] uppercase tracking-widest text-text-subtle mt-0.5">
                Países
              </div>
            </div>
            <div
              className="w-px h-10"
              style={{ background: "hsl(220 12% 20%)" }}
            />
            <div className="text-center">
              <div className="text-2xl font-bold font-mono text-accent">{plannedTrips}</div>
              <div className="text-[10px] uppercase tracking-widest text-text-subtle mt-0.5">
                Em Breve
              </div>
            </div>
          </motion.div>
        </div>

        {/* Next adventure banner */}
        {upcoming && (
          <Link href={`/trips/${upcoming.id}`}>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mt-8 flex items-center gap-3 rounded-xl px-4 py-3 group hover:bg-bg-hover transition-colors"
              style={{
                background: "hsl(32 30% 12% / 0.5)",
                border: "1px solid hsl(32 40% 22% / 0.4)",
              }}
            >
              <div className="rounded-lg p-2 group-hover:scale-110 transition-transform" style={{ background: "hsl(32 40% 18%)" }}>
                <Compass className="h-4 w-4 text-accent group-hover:rotate-45 transition-transform" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-widest text-amber-600/80">
                  Próxima Aventura
                </p>
                <p className="text-sm font-medium text-text truncate group-hover:text-accent transition-colors">
                  {upcoming.name}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-text-muted">
                <MapPin className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{upcoming.destination}</span>
              </div>
              <div className="ml-2 text-text-subtle group-hover:text-accent transition-colors">
                <ChevronRight className="h-4 w-4" />
              </div>
            </motion.div>
          </Link>
        )}
      </div>

      {/* Bottom border glow */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, hsl(32 60% 35% / 0.4), transparent)",
        }}
      />
    </div>
  );
}
