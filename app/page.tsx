"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Map, Plane, CheckSquare, Plus } from "lucide-react";
import { Navbar } from "@/components/shared/navbar";
import { DashboardHero } from "@/components/dashboard/hero";
import { TripCard } from "@/components/trips/trip-card";
import { PromiseCard } from "@/components/shared/promise-card";
import { FlightAlertCard } from "@/components/flights/flight-alert-card";
import { ChecklistCard } from "@/components/checklist/checklist-card";
import { GlobeView } from "@/components/dashboard/globe-view";
import { AddTripModal } from "@/components/trips/add-trip-modal";
import { supabase } from "@/lib/supabase/client";
import { spChecklists, flightAlerts, trips as seedTrips } from "@/lib/data/seed";
import type { TripWithStats, TripStatus } from "@/lib/supabase/types";

type FilterOption = "all" | TripStatus;

const filterOptions: { value: FilterOption; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "active", label: "Ativas" },
  { value: "planned", label: "Planejadas" },
  { value: "draft", label: "Rascunhos" },
  { value: "completed", label: "Concluídas" },
];

export default function DashboardPage() {
  const [filter, setFilter] = useState<FilterOption>("all");
  const [trips, setTrips] = useState<TripWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<{name: string, code: string} | undefined>();

  useEffect(() => {
    const fetchTrips = async () => {
      const { data, error } = await supabase.from('trips').select('*').order('start_date', { ascending: true });
      if (data) {
        setTrips(data as any);
      }
      setLoading(false);
    };
    fetchTrips();
  }, []);

  const handleAddTrip = async (tripData: any) => {
    let finalCountryCode = tripData.country_code;

    // Fallback: reverse geocode if no code was passed (e.g., they typed manually)
    if (!finalCountryCode || finalCountryCode === "XX") {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(tripData.destination)}&format=json&addressdetails=1&limit=1`);
        const data = await res.json();
        if (data && data[0] && data[0].address && data[0].address.country_code) {
          finalCountryCode = data[0].address.country_code.toUpperCase();
        } else {
          finalCountryCode = "XX";
        }
      } catch (err) {
        console.error("Geocoding failed", err);
        finalCountryCode = "XX";
      }
    }

    const newTrip = {
      id: crypto.randomUUID(),
      ...tripData,
      budget_spent: 0,
      budget_currency: 'BRL',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      country_code: finalCountryCode, 
    };
    
    // Optimistic UI update
    setTrips((prev) => [...prev, newTrip]);

    // Insert to Supabase
    const { error } = await supabase.from('trips').insert([newTrip]);
    if (error) {
      console.error("Error inserting trip:", error);
    }
  };

  const handleGlobeClick = (countryName: string, countryCode: string) => {
    setSelectedCountry({ name: countryName, code: countryCode });
    setIsModalOpen(true);
  };

  const filteredTrips =
    filter === "all" ? trips : trips.filter((t) => t.status === filter);

  const brazilTrips = filteredTrips.filter((t) => t.country_code === "BR");
  const internationalTrips = filteredTrips.filter((t) => t.country_code !== "BR" && t.country_code !== "XX");
  const unmappedTrips = filteredTrips.filter((t) => t.country_code === "XX"); // New trips

  return (
    <>
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 pb-28 sm:pb-12">
        <DashboardHero trips={trips} />

        {/* 3D Globe Section */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🌍</span>
              <h2 className="font-serif text-xl font-bold text-text">
                Explore o Mundo
              </h2>
            </div>
            <button 
              onClick={() => { setSelectedCountry(undefined); setIsModalOpen(true); }}
              className="btn-accent flex items-center gap-2 text-sm"
            >
              <Plus className="h-4 w-4" />
              Adicionar Destino
            </button>
          </div>
          <GlobeView trips={trips} onAddTrip={handleGlobeClick} />
        </section>

        {/* Trips Grid */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Map className="h-5 w-5 text-accent" />
              <h2 className="font-serif text-xl font-bold text-text">
                Nossas Aventuras
              </h2>
            </div>
            <div className="hidden sm:flex items-center gap-1 rounded-xl p-1" style={{ background: "hsl(220 16% 10%)" }}>
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
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {loading && (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm text-text-muted">Carregando aventuras...</p>
            </div>
          )}

          {!loading && unmappedTrips.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xs uppercase tracking-widest text-text-subtle font-semibold mb-4 flex items-center gap-2">
                <span>📍</span> Novas Aventuras
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {unmappedTrips.map((trip, i) => (
                  <TripCard key={trip.id} trip={trip} index={i} />
                ))}
              </div>
            </div>
          )}

          {brazilTrips.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xs uppercase tracking-widest text-text-subtle font-semibold mb-4 flex items-center gap-2">
                <span>🇧🇷</span> Brasil
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {brazilTrips.map((trip, i) => (
                  <TripCard key={trip.id} trip={trip} index={i} />
                ))}
              </div>
            </div>
          )}

          {internationalTrips.length > 0 && (
            <div>
              <h3 className="text-xs uppercase tracking-widest text-text-subtle font-semibold mb-4 flex items-center gap-2">
                <span>🌍</span> Internacional
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {internationalTrips.map((trip, i) => (
                  <TripCard key={trip.id} trip={trip} index={brazilTrips.length + i} />
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Bottom Modules */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xl">📜</span>
              <h2 className="font-serif text-xl font-bold text-text">A Promessa™</h2>
            </div>
            <PromiseCard />
          </div>

          <div className="lg:col-span-4">
            <div className="flex items-center gap-3 mb-4">
              <Plane className="h-5 w-5 text-accent" />
              <h2 className="font-serif text-xl font-bold text-text">Alertas de Voo</h2>
            </div>
            <div className="space-y-4">
              {flightAlerts.map((alert, i) => (
                <FlightAlertCard key={alert.id} alert={alert} index={i} />
              ))}
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="flex items-center gap-3 mb-4">
              <CheckSquare className="h-5 w-5 text-accent" />
              <h2 className="font-serif text-xl font-bold text-text">Rolês em SP</h2>
            </div>
            <div className="space-y-3">
              {spChecklists.map((cl) => (
                <ChecklistCard key={cl.id} checklist={cl} />
              ))}
            </div>
          </div>
        </div>
      </main>

      <AddTripModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        countryName={selectedCountry?.name}
        countryCode={selectedCountry?.code}
        onAdd={handleAddTrip}
      />
    </>
  );
}
