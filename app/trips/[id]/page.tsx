"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Wallet,
  CheckSquare,
  Clock,
  Globe,
  Edit2,
} from "lucide-react";
import { Navbar } from "@/components/shared/navbar";
import { PromiseCard } from "@/components/shared/promise-card";
import { ChecklistCard } from "@/components/checklist/checklist-card";
import { AddChecklistModal } from "@/components/checklist/add-checklist-modal";
import { EditBudgetModal } from "@/components/trips/edit-budget-modal";
import { EditTripModal } from "@/components/trips/edit-trip-modal";
import { TripScratchpad } from "@/components/trips/trip-scratchpad";
import { formatMoney, formatDate, daysUntil, countryFlag, percentage } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";

const statusConfig: Record<string, { label: string; class: string }> = {
  draft: { label: "Rascunho", class: "badge-draft" },
  planned: { label: "Planejado", class: "badge-planned" },
  active: { label: "Ativo", class: "badge-active" },
  completed: { label: "Concluído", class: "badge-completed" },
  cancelled: { label: "Cancelado", class: "badge-draft" },
};

export default function TripDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  
  const [trip, setTrip] = useState<any>(null);
  const [checklists, setChecklists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isEditTripModalOpen, setIsEditTripModalOpen] = useState(false);
  const [isAddChecklistModalOpen, setIsAddChecklistModalOpen] = useState(false);

  const fetchData = async () => {
    const [tripRes, checklistsRes] = await Promise.all([
      supabase.from('trips').select('*').eq('id', id).single(),
      supabase.from('checklists').select('*, items:checklist_items(*)').eq('trip_id', id).order('sort_order', { ascending: true })
    ]);

    if (tripRes.data) setTrip(tripRes.data);
    
    if (checklistsRes.data) {
      // Sort items within each checklist
      const sortedChecklists = checklistsRes.data.map(cl => ({
        ...cl,
        items: (cl.items || []).sort((a: any, b: any) => a.sort_order - b.sort_order)
      }));
      setChecklists(sortedChecklists);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();

    // Subscribe to realtime updates for checklist items
    const channel = supabase.channel('checklist_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'checklist_items' }, () => {
        fetchData(); // Refetch to keep simple and consistent
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'checklists' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="mx-auto max-w-4xl px-4 pt-32 text-center">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-text-muted">Carregando viagem...</p>
        </main>
      </>
    );
  }

  if (!trip) {
    return (
      <>
        <Navbar />
        <main className="mx-auto max-w-4xl px-4 pt-28 text-center">
          <p className="text-text-muted">Viagem não encontrada 😢</p>
          <Link href="/" className="text-accent text-sm mt-4 inline-block hover:underline">
            ← Voltar ao início
          </Link>
        </main>
      </>
    );
  }

  const flag = countryFlag(trip.country_code);
  const budgetPct = percentage(trip.budget_spent, trip.budget_total);
  const status = statusConfig[trip.status];
  const { days, isPast } = daysUntil(trip.start_date);
  const isBeto = trip.id === "35b3ee28-097c-4ab4-8e11-eec74b1e3ab5" || trip.id === "t-bc";

  const handleBudgetUpdate = async (total: number, spent: number) => {
    // Optimistic UI update
    setTrip({ ...trip, budget_total: total, budget_spent: spent });
    
    // Update Supabase
    const { error } = await supabase.from('trips').update({ budget_total: total, budget_spent: spent }).eq('id', trip.id);
    if (error) {
      console.error("Error updating budget:", error);
    }
  };

  const handleTripUpdate = async (tripId: string, updates: any) => {
    setTrip({ ...trip, ...updates });
    const { error } = await supabase.from('trips').update(updates).eq('id', tripId);
    if (error) {
      console.error("Error updating trip:", error);
    }
  };

  const handleAddChecklist = async (data: any) => {
    await supabase.from('checklists').insert({
      trip_id: trip.id,
      name: data.name,
      description: data.description || null,
      icon: data.icon,
      sort_order: checklists.length,
    });
    // The realtime subscription will trigger a refetch automatically!
  };

  return (
    <>
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 sm:px-6 pt-24 pb-28 sm:pb-12">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-accent transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-card p-6 sm:p-8 mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
              style={{ background: "hsl(220 16% 14%)" }}
            >
              {flag}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="font-serif text-2xl sm:text-3xl font-bold text-text">
                      {trip.name}
                    </h1>
                    <button 
                      onClick={() => setIsEditTripModalOpen(true)}
                      className="p-1.5 rounded-lg bg-bg-elevated/50 hover:bg-bg-hover text-text-subtle hover:text-accent transition-colors"
                      title="Editar Viagem"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </div>
                  {trip.description && (
                    <p className="text-sm text-text-muted mt-2 max-w-xl leading-relaxed">
                      {trip.description}
                    </p>
                  )}
                </div>
                <span className={`badge ${status.class} flex-shrink-0`}>
                  {status.label}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-4 text-sm text-text-muted">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  <span>{trip.destination}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {formatDate(trip.start_date, "long")} – {formatDate(trip.end_date, "long")}
                  </span>
                </div>
                {trip.timezone && (
                  <div className="flex items-center gap-1.5">
                    <Globe className="h-4 w-4" />
                    <span className="text-xs">{trip.timezone}</span>
                  </div>
                )}
                {!isPast && trip.status !== "completed" && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    <span className="text-accent font-medium">{days} dias</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-border-subtle relative group">
            <button 
              onClick={() => setIsBudgetModalOpen(true)}
              className="absolute right-0 top-6 p-2 rounded-lg bg-bg-elevated/50 hover:bg-bg-hover text-text-subtle hover:text-accent transition-colors opacity-0 group-hover:opacity-100"
            >
              <Edit2 className="h-4 w-4" />
            </button>

            <div className="flex items-center justify-between text-sm mb-2 pr-10">
              <div className="flex items-center gap-2 text-text-muted">
                <Wallet className="h-4 w-4" />
                <span>Orçamento</span>
              </div>
              <div className="font-mono">
                <span className="text-accent font-semibold">
                  {formatMoney(trip.budget_spent, trip.budget_currency)}
                </span>
                <span className="text-text-subtle"> / </span>
                <span className="text-text-muted">
                  {formatMoney(trip.budget_total, trip.budget_currency)}
                </span>
              </div>
            </div>
            <div className="progress-bar" style={{ height: "6px" }}>
              <motion.div
                className="progress-bar-fill"
                initial={{ width: 0 }}
                animate={{ width: `${budgetPct}%` }}
                transition={{ duration: 0.8, delay: 0.3 }}
              />
            </div>
            <p className="text-xs text-text-subtle mt-1.5 text-right">
              {budgetPct}% utilizado
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {isBeto && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2"
            >
              <PromiseCard />
            </motion.div>
          )}

          {checklists.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={isBeto ? "" : "lg:col-span-2"}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <CheckSquare className="h-5 w-5 text-accent" />
                  <h2 className="font-serif text-lg font-bold text-text">Checklists</h2>
                </div>
                <button
                  onClick={() => setIsAddChecklistModalOpen(true)}
                  className="text-xs font-semibold uppercase tracking-wider text-accent hover:text-accent-hover transition-colors px-3 py-1.5 rounded-lg bg-accent/10 hover:bg-accent/20"
                >
                  + Nova Lista
                </button>
              </div>
              <div className="space-y-3">
                {checklists.map((cl) => (
                  <ChecklistCard key={cl.id} checklist={cl} />
                ))}
              </div>
            </motion.div>
          )}

          {checklists.length === 0 && !isBeto && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2"
            >
              <div className="glass-card p-12 text-center">
                <div className="text-4xl mb-4">🗺️</div>
                <h3 className="font-serif text-lg font-semibold text-text mb-2">
                  Nenhum Checklist
                </h3>
                <p className="text-sm text-text-muted max-w-md mx-auto mb-6">
                  Crie listas de malas, documentos e tarefas para se organizar.
                </p>
                <button
                  onClick={() => setIsAddChecklistModalOpen(true)}
                  className="btn-accent px-6 py-2.5 text-sm"
                >
                  Criar Primeira Lista
                </button>
              </div>
            </motion.div>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <TripScratchpad tripId={trip.id} initialNotes={trip.notes} />
        </motion.div>
      </main>

      <EditBudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        tripId={trip.id}
        currentBudgetTotal={trip.budget_total}
        currentBudgetSpent={trip.budget_spent}
        currency={trip.budget_currency}
        onUpdate={handleBudgetUpdate}
      />

      <EditTripModal
        isOpen={isEditTripModalOpen}
        onClose={() => setIsEditTripModalOpen(false)}
        trip={trip}
        onUpdate={handleTripUpdate}
      />

      <AddChecklistModal
        isOpen={isAddChecklistModalOpen}
        onClose={() => setIsAddChecklistModalOpen(false)}
        onAdd={handleAddChecklist}
      />
    </>
  );
}
