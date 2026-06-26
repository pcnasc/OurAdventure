"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  MapPin,
  Calendar,
  Wallet,
  ChevronRight,
  CheckCircle2,
  Clock,
} from "lucide-react";
import type { TripWithStats } from "@/lib/supabase/types";
import { formatMoney, formatDate, daysUntil, countryFlag, percentage } from "@/lib/utils";

interface TripCardProps {
  trip: TripWithStats;
  index: number;
}

const statusConfig: Record<string, { label: string; class: string }> = {
  draft: { label: "Rascunho", class: "badge-draft" },
  planned: { label: "Planejado", class: "badge-planned" },
  active: { label: "Ativo", class: "badge-active" },
  completed: { label: "Concluído", class: "badge-completed" },
  cancelled: { label: "Cancelado", class: "badge-draft" },
};

export function TripCard({ trip, index }: TripCardProps) {
  const status = statusConfig[trip.status];
  const budgetPct = percentage(trip.budget_spent, trip.budget_total);
  const flag = countryFlag(trip.country_code);
  const { days, isPast } = daysUntil(trip.start_date);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.06,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    >
      <Link href={`/trips/${trip.id}`} className="block group">
        <div className="glass-card p-5 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl" role="img" aria-label={trip.country_code ?? "world"}>
                {flag}
              </span>
              <div>
                <h3 className="font-serif text-base font-semibold text-text leading-tight group-hover:text-accent transition-colors">
                  {trip.name}
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <MapPin className="h-3 w-3 text-text-muted" />
                  <span className="text-xs text-text-muted">{trip.destination}</span>
                </div>
              </div>
            </div>
            <span className={`badge ${status.class}`}>{status.label}</span>
          </div>

          {/* Description */}
          {trip.description && (
            <p className="text-xs text-text-muted leading-relaxed mb-4 line-clamp-2">
              {trip.description}
            </p>
          )}

          {/* Meta row */}
          <div className="flex items-center gap-4 mb-4 text-xs text-text-muted">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              <span>
                {formatDate(trip.start_date)} – {formatDate(trip.end_date)}
              </span>
            </div>
            {trip.status !== "completed" && !isPast && (
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span>{days} dias</span>
              </div>
            )}
          </div>

          {/* Budget progress */}
          <div className="mt-auto">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <div className="flex items-center gap-1.5 text-text-muted">
                <Wallet className="h-3.5 w-3.5" />
                <span>Orçamento</span>
              </div>
              <span className="font-mono text-text-subtle">
                {formatMoney(trip.budget_spent, trip.budget_currency)} /{" "}
                <span className="text-text-muted">
                  {formatMoney(trip.budget_total, trip.budget_currency)}
                </span>
              </span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-bar-fill"
                style={{ width: `${budgetPct}%` }}
              />
            </div>

            {/* Quick stats footer */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border-subtle">
              <div className="flex items-center gap-3 text-xs text-text-subtle">
                {trip.activities_count !== undefined && trip.activities_count > 0 && (
                  <span>{trip.activities_count} atividades</span>
                )}
                {trip.checklist_progress !== undefined && trip.checklist_progress > 0 && (
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-success" />
                    {trip.checklist_progress}%
                  </span>
                )}
              </div>
              <ChevronRight className="h-4 w-4 text-text-subtle group-hover:text-accent group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
