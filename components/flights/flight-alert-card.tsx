"use client";

import { motion } from "framer-motion";
import {
  Plane,
  ArrowRight,
  Target,
  TrendingDown,
  Calendar,
  Clock,
  Radar,
  ExternalLink,
} from "lucide-react";
import type { FlightAlertWithSnapshots } from "@/lib/supabase/types";
import { formatMoney, formatDate } from "@/lib/utils";

const statusLabels: Record<string, { label: string; class: string }> = {
  active: { label: "Monitorando", class: "badge-active" },
  paused: { label: "Pausado", class: "badge-draft" },
  triggered: { label: "Preço atingido!", class: "badge-planned" },
  expired: { label: "Expirado", class: "badge-draft" },
};

interface FlightAlertCardProps {
  alert: FlightAlertWithSnapshots;
  index?: number;
}

export function FlightAlertCard({ alert, index = 0 }: FlightAlertCardProps) {
  const status = statusLabels[alert.status];
  const isActive = alert.status === "active";

  const buildGoogleFlightsUrl = () => {
    const from = alert.origin_iata;
    const to = alert.destination_iata;
    const dateOut = alert.departure_date;
    const dateIn = alert.return_date;
    if (dateIn) {
      return `https://www.google.com/travel/flights?q=Flights%20to%20${to}%20from%20${from}%20on%20${dateOut}%20through%20${dateIn}%20for%202%20adults`;
    }
    return `https://www.google.com/travel/flights?q=Flights%20to%20${to}%20from%20${from}%20on%20${dateOut}%20for%202%20adults`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className={`glass-card p-5 relative overflow-hidden ${
        isActive ? "animate-pulse-glow" : ""
      }`}
      style={
        isActive
          ? {
              animationDuration: "4s",
            }
          : {}
      }
    >
      {/* Active radar indicator */}
      {isActive && (
        <div className="absolute top-4 right-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            <Radar className="h-4 w-4 text-accent/40" />
          </motion.div>
        </div>
      )}

      {/* Route */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2 flex-1">
          <div
            className="rounded-lg p-2"
            style={{ background: "hsl(220 16% 14%)" }}
          >
            <Plane className="h-4 w-4 text-accent" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-lg font-bold text-text">
              {alert.origin_iata}
            </span>
            <ArrowRight className="h-4 w-4 text-text-subtle" />
            <span className="font-mono text-lg font-bold text-text">
              {alert.destination_iata}
            </span>
          </div>
        </div>
        <span className={`badge ${status.class}`}>{status.label}</span>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <Calendar className="h-3.5 w-3.5" />
          <span>
            {formatDate(alert.departure_date)}
            {alert.return_date && ` – ${formatDate(alert.return_date)}`}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <span className="uppercase text-[10px] tracking-wider font-medium px-1.5 py-0.5 rounded bg-bg-elevated">
            {alert.cabin.replace("_", " ")}
          </span>
        </div>
      </div>

      {/* Price targets */}
      <div
        className="rounded-xl p-4 grid grid-cols-2 gap-4"
        style={{
          background: "hsl(220 16% 8% / 0.5)",
          border: "1px solid hsl(220 12% 16%)",
        }}
      >
        <div>
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-text-subtle mb-1">
            <Target className="h-3 w-3" />
            Alvo
          </div>
          <div className="font-mono text-lg font-bold text-accent">
            {formatMoney(alert.target_price, alert.currency)}
          </div>
        </div>
        <div>
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-text-subtle mb-1">
            <TrendingDown className="h-3 w-3" />
            Menor Preço
          </div>
          <div className="font-mono text-lg font-bold text-text">
            {alert.lowest_price_seen
              ? formatMoney(alert.lowest_price_seen, alert.currency)
              : "—"}
          </div>
        </div>
      </div>

      {/* Last checked */}
      {alert.last_checked_at && (
        <div className="flex items-center gap-1.5 mt-3 text-[10px] text-text-subtle">
          <Clock className="h-3 w-3" />
          <span>Verificado: {new Date(alert.last_checked_at).toLocaleString("pt-BR")}</span>
        </div>
      )}

      {/* Airlines preference */}
      {alert.preferred_airlines && alert.preferred_airlines.length > 0 && (
        <div className="flex items-center gap-2 mt-3">
          <span className="text-[10px] text-text-subtle uppercase tracking-wider">
            Cias:
          </span>
          {alert.preferred_airlines.map((code) => (
            <span
              key={code}
              className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded"
              style={{
                background: "hsl(32 30% 15%)",
                color: "hsl(32 60% 60%)",
              }}
            >
              {code}
            </span>
          ))}
        </div>
      )}

      {/* Empty state for snapshots */}
      {(!alert.snapshots || alert.snapshots.length === 0) && isActive && (
        <div className="mt-4 text-center py-4 rounded-lg" style={{ background: "hsl(220 16% 8% / 0.3)" }}>
          <p className="text-xs text-text-subtle">
            O scraper Go vai preencher os dados de preço aqui ✈️
          </p>
        </div>
      )}

      {/* Action Button */}
      {alert.snapshots && alert.snapshots.length > 0 && (
        <div className="mt-4">
          <a
            href={buildGoogleFlightsUrl()}
            target="_blank"
            rel="noreferrer"
            className="w-full bg-[hsl(220,16%,14%)] hover:bg-[hsl(220,16%,18%)] border border-border-subtle transition-colors text-text text-xs font-semibold uppercase tracking-wider py-2.5 px-4 rounded-xl flex items-center justify-center gap-2"
          >
            Comprar no Google Flights
            <ExternalLink className="h-4 w-4 text-text-subtle" />
          </a>
        </div>
      )}
    </motion.div>
  );
}
