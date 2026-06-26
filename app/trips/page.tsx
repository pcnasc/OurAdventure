"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Map, Filter } from "lucide-react";
import { Navbar } from "@/components/shared/navbar";
import { TripCard } from "@/components/trips/trip-card";
import { supabase } from "@/lib/supabase/client";
import type { TripWithStats, TripStatus } from "@/lib/supabase/types";

type FilterOption = "all" | TripStatus;

const filterOptions: { value: FilterOption; label: string; emoji?: string }[] = [
  { value: "all", label: "Todas" },
  { value: "active", label: "Ativas", emoji: "🟢" },
  { value: "planned", label: "Planejadas", emoji: "🟡" },
  { value: "draft", label: "Rascunhos", emoji: "⚪" },
  { value: "completed", label: "Concluídas", emoji: "✅" },
];

export default function TripsPage() {
  const [filter, setFilter] = useState<FilterOption>("all");
  const [trips, setTrips] = useState<TripWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrips = async () => {
      const { data } = await supabase.from('trips').select('*').order('start_date', { ascending: true });
      if (data) setTrips(data as any);
      setLoading(false);
    };
    fetchTrips();
  }, []);

  const filteredTrips =
    filter === "all" ? trips : trips.filter((t) => t.status === filter);

  const brazilTrips = filteredTrips.filter((t) => t.country_code === "BR");
  const internationalTrips = filteredTrips.filter((t) => t.country_code !== "BR" && t.country_code !== "XX");
  const unmappedTrips = filteredTrips.filter((t) => t.country_code === "XX");

  return (
    <>
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 pb-28 sm:pb-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
        >
          <div className="flex items-center gap-3">
            <Map className="h-6 w-6 text-accent" />
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-text">
              Nossas Viagens
            </h1>
            <span className="badge badge-draft">{trips.length}</span>
          </div>

          {/* Filter */}
          <div className="flex items-center gap-1 rounded-xl p-1" style={{ background: "hsl(220 16% 10%)" }}>
            {filterOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFilter(opt.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filter === opt.value
                    ? "bg-accent/20 text-accent"
                    : "text-text-muted hover:text-text"
                }`}
              >
                {opt.emoji && <span className="mr-1">{opt.emoji}</span>}
                {opt.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Unmapped (New Trips) */}
        {!loading && unmappedTrips.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xs uppercase tracking-widest text-text-subtle font-semibold mb-4 flex items-center gap-2">
              <span>📍</span> Novas Aventuras
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {unmappedTrips.map((trip, i) => (
                <TripCard key={trip.id} trip={trip} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* Brazil */}
        {!loading && brazilTrips.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xs uppercase tracking-widest text-text-subtle font-semibold mb-4 flex items-center gap-2">
              <span>🇧🇷</span> Brasil
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {brazilTrips.map((trip, i) => (
                <TripCard key={trip.id} trip={trip} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* International */}
        {!loading && internationalTrips.length > 0 && (
          <section>
            <h2 className="text-xs uppercase tracking-widest text-text-subtle font-semibold mb-4 flex items-center gap-2">
              <span>🌍</span> Internacional
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {internationalTrips.map((trip, i) => (
                <TripCard key={trip.id} trip={trip} index={brazilTrips.length + i} />
              ))}
            </div>
          </section>
        )}

        {/* Loading state */}
        {loading && (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-text-muted">Carregando viagens...</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && filteredTrips.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-4xl mb-4">🗺️</div>
            <p className="text-text-muted">
              Nenhuma viagem com esse filtro.
            </p>
          </motion.div>
        )}
      </main>
    </>
  );
}
