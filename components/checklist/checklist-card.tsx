"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Circle,
  Clock,
  SkipForward,
  MapPin,
  ChevronDown,
  ChevronUp,
  Briefcase,
  Camera,
  Plus,
  ScrollText,
  CheckSquare,
  Bike,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import type { ChecklistWithItems, ChecklistItemStatus } from "@/lib/supabase/types";

const statusIcons: Record<ChecklistItemStatus, React.ComponentType<{ className?: string }>> = {
  pending: Circle,
  in_progress: Clock,
  done: CheckCircle2,
  skipped: SkipForward,
};

const statusColors: Record<ChecklistItemStatus, string> = {
  pending: "text-text-subtle",
  in_progress: "text-amber-400",
  done: "text-emerald-400",
  skipped: "text-text-subtle/50",
};

interface ChecklistCardProps {
  checklist: ChecklistWithItems;
}

export function ChecklistCard({ checklist }: ChecklistCardProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [items, setItems] = useState(checklist.items || []);
  const [newItemLabel, setNewItemLabel] = useState("");
  const [newItemAssignee, setNewItemAssignee] = useState<"Pedro" | "Alice" | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Sync with upstream changes (realtime)
  useEffect(() => {
    setItems(checklist.items || []);
  }, [checklist.items]);

  const doneCount = items.filter((i) => i.status === "done").length;
  const total = items.length;
  const progressPct = total > 0 ? Math.round((doneCount / total) * 100) : 0;

  const cycleStatus = async (id: string) => {
    const item = items.find(i => i.id === id);
    if (!item) return;

    const next: Record<ChecklistItemStatus, ChecklistItemStatus> = {
      pending: "done",
      in_progress: "done",
      done: "pending",
      skipped: "pending",
    };
    const newStatus = next[item.status];

    // Optimistic update
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: newStatus } : i))
    );

    // Supabase update
    await supabase
      .from('checklist_items')
      .update({ status: newStatus })
      .eq('id', id);
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemLabel.trim()) return;
    setIsAdding(true);
    
    const { data, error } = await supabase
      .from('checklist_items')
      .insert({
        checklist_id: checklist.id,
        label: newItemLabel.trim(),
        sort_order: items.length,
        assigned_to: newItemAssignee,
      })
      .select()
      .single();

    if (data) {
      setItems((prev) => [...prev, data]);
      setNewItemLabel("");
      setNewItemAssignee(null);
    }
    setIsAdding(false);
  };

  return (
    <div className="glass-subtle overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-bg-hover/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="text-lg text-text-muted">
            {checklist.icon === "scroll-text" ? <ScrollText className="h-5 w-5" /> : 
             checklist.icon === "map-pin" ? <MapPin className="h-5 w-5" /> : 
             checklist.icon === "bike" ? <Bike className="h-5 w-5" /> : 
             checklist.icon === "briefcase" ? <Briefcase className="h-5 w-5" /> :
             checklist.icon === "camera" ? <Camera className="h-5 w-5" /> :
             <CheckSquare className="h-5 w-5" />}
          </div>
          <div className="text-left">
            <h4 className="text-sm font-semibold text-text">{checklist.name}</h4>
            {checklist.description && (
              <p className="text-xs text-text-muted mt-0.5">{checklist.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-text-muted">
              {doneCount}/{total}
            </span>
            <div className="w-16 progress-bar">
              <motion.div
                className="progress-bar-fill"
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>
          {isOpen ? (
            <ChevronUp className="h-4 w-4 text-text-subtle" />
          ) : (
            <ChevronDown className="h-4 w-4 text-text-subtle" />
          )}
        </div>
      </button>

      {/* Items */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-1">
              {items.map((item) => {
                const StatusIcon = statusIcons[item.status];
                const colorClass = statusColors[item.status];
                const isDone = item.status === "done";

                return (
                  <motion.button
                    key={item.id}
                    onClick={() => cycleStatus(item.id)}
                    className="w-full flex items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-bg-hover/30 group"
                    layout
                    transition={{ duration: 0.2 }}
                  >
                    <motion.div
                      className="mt-0.5 flex-shrink-0"
                      whileTap={{ scale: 0.8 }}
                    >
                      <StatusIcon className={`h-4.5 w-4.5 ${colorClass} transition-colors`} />
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <span
                        className={`text-sm leading-snug transition-all ${
                          isDone
                            ? "line-through text-text-subtle"
                            : "text-text group-hover:text-accent"
                        }`}
                      >
                        {item.label}
                      </span>
                      {item.notes && (
                        <p className="text-xs text-text-subtle mt-0.5 leading-relaxed">
                          {item.notes}
                        </p>
                      )}
                    </div>
                    {item.assigned_to && (
                      <span
                        className="text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{
                          background: item.assigned_to === "Pedro" ? "hsl(210 40% 15%)" : "hsl(320 30% 15%)",
                          color: item.assigned_to === "Pedro" ? "hsl(210 60% 60%)" : "hsl(320 50% 65%)",
                        }}
                      >
                        {item.assigned_to}
                      </span>
                    )}
                  </motion.button>
                );
              })}

              {/* Add New Item */}
              <form onSubmit={handleAddItem} className="mt-2 flex items-center gap-2 px-3 py-2">
                <Plus className="h-4 w-4 text-text-subtle flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Novo item..."
                  className="flex-1 min-w-0 bg-transparent border-none text-sm text-text placeholder:text-text-subtle focus:outline-none focus:ring-0"
                  value={newItemLabel}
                  onChange={(e) => setNewItemLabel(e.target.value)}
                  disabled={isAdding}
                />
                
                {/* Assignee Selection - Only visible when typing */}
                {newItemLabel.trim().length > 0 && (
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => setNewItemAssignee(prev => prev === "Pedro" ? null : "Pedro")}
                      className={`text-[9px] font-medium uppercase tracking-wider px-2 py-1 rounded-full transition-colors ${
                        newItemAssignee === "Pedro" 
                          ? "bg-[hsl(210,40%,15%)] text-[hsl(210,60%,60%)]" 
                          : "bg-bg-elevated border border-border-subtle text-text-subtle hover:text-text hover:bg-bg-hover"
                      }`}
                    >
                      Pedro
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewItemAssignee(prev => prev === "Alice" ? null : "Alice")}
                      className={`text-[9px] font-medium uppercase tracking-wider px-2 py-1 rounded-full transition-colors ${
                        newItemAssignee === "Alice" 
                          ? "bg-[hsl(320,30%,15%)] text-[hsl(320,50%,65%)]" 
                          : "bg-bg-elevated border border-border-subtle text-text-subtle hover:text-text hover:bg-bg-hover"
                      }`}
                    >
                      Alice
                    </button>
                  </div>
                )}
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
