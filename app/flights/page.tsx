"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plane, Plus, Radar, Loader2 } from "lucide-react";
import { Navbar } from "@/components/shared/navbar";
import { FlightAlertCard } from "@/components/flights/flight-alert-card";
import { AddFlightAlertModal } from "@/components/flights/add-flight-alert-modal";
import { supabase } from "@/lib/supabase/client";
import type { FlightAlertWithSnapshots } from "@/lib/supabase/types";

export default function FlightsPage() {
  const [alerts, setAlerts] = useState<FlightAlertWithSnapshots[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchAlerts = async () => {
    const { data } = await supabase
      .from('flight_alerts')
      .select('*, snapshots:flight_price_snapshots(*)')
      .order('created_at', { ascending: false });

    if (data) {
      setAlerts(data as FlightAlertWithSnapshots[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAlerts();

    const channel = supabase.channel('flight_alerts_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'flight_alerts' }, () => {
        fetchAlerts();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'flight_price_snapshots' }, () => {
        fetchAlerts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const activeAlerts = alerts.filter((a) => a.status === "active");
  const otherAlerts = alerts.filter((a) => a.status !== "active");

  return (
    <>
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 sm:px-6 pt-24 pb-28 sm:pb-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-3">
            <Plane className="h-6 w-6 text-accent" />
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-text">
              Alertas de Voo
            </h1>
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="btn-accent flex items-center gap-2 text-sm"
          >
            <Plus className="h-4 w-4" />
            Novo Alerta
          </button>
        </motion.div>

        {/* Go Scraper Info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-5 mb-8"
        >
          <div className="flex items-start gap-4">
            <div
              className="rounded-xl p-3 flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, hsl(32 40% 15%), hsl(32 30% 10%))",
              }}
            >
              <Radar className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text mb-1">
                Go Scraper Microservice
              </h3>
              <p className="text-xs text-text-muted leading-relaxed">
                O microserviço em Go monitora os alertas ativos e busca preços usando goroutines
                para requisições concorrentes a APIs de agregadores de voos. Os dados de preço
                aparecem aqui em tempo real via Supabase Realtime.
              </p>
              <div className="flex items-center gap-2 mt-3">
                <span
                  className="inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider px-2.5 py-1 rounded-full"
                  style={{
                    background: "hsl(45 40% 15%)",
                    color: "hsl(45 70% 55%)",
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
                  Aguardando Deploy
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Active Alerts */}
        {activeAlerts.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xs uppercase tracking-widest text-text-subtle font-semibold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Monitorando
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activeAlerts.map((alert, i) => (
                <FlightAlertCard key={alert.id} alert={alert} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* Other Alerts */}
        {otherAlerts.length > 0 && (
          <section>
            <h2 className="text-xs uppercase tracking-widest text-text-subtle font-semibold mb-4">
              Histórico
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {otherAlerts.map((alert, i) => (
                <FlightAlertCard key={alert.id} alert={alert} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 text-accent animate-spin" />
          </div>
        )}

        {/* Empty state */}
        {!loading && alerts.length === 0 && (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">✈️</div>
            <p className="text-text-muted mb-4">Nenhum alerta de voo configurado.</p>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="btn-accent text-sm"
            >
              Criar Primeiro Alerta
            </button>
          </div>
        )}
      </main>

      <AddFlightAlertModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
    </>
  );
}
