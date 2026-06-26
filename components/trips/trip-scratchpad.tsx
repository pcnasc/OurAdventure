"use client";

import { useState, useEffect, useCallback } from "react";
import { BookOpen, Check, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

interface TripScratchpadProps {
  tripId: string;
  initialNotes: string | null;
}

export function TripScratchpad({ tripId, initialNotes }: TripScratchpadProps) {
  const [notes, setNotes] = useState(initialNotes || "");
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  // Debounced save
  useEffect(() => {
    if (notes === (initialNotes || "")) return;

    setSaveStatus("saving");
    const timeoutId = setTimeout(async () => {
      setIsSaving(true);
      const { error } = await supabase
        .from("trips")
        .update({ notes })
        .eq("id", tripId);
      
      setIsSaving(false);
      if (!error) {
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      } else {
        console.error("Error saving notes:", error);
        setSaveStatus("idle");
      }
    }, 1000); // Save 1s after user stops typing

    return () => clearTimeout(timeoutId);
  }, [notes, tripId, initialNotes]);

  return (
    <div className="mt-12 mb-8 relative group">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <BookOpen className="h-5 w-5 text-accent" />
          <h2 className="font-serif text-xl font-bold text-text">
            Planejamento Livre
          </h2>
        </div>
        <div className="text-xs font-medium text-text-subtle flex items-center gap-1.5 min-w-[80px] justify-end">
          {saveStatus === "saving" && (
            <>
              <Loader2 className="h-3 w-3 animate-spin" /> Salvando...
            </>
          )}
          {saveStatus === "saved" && (
            <>
              <Check className="h-3 w-3 text-green-500" /> Salvo
            </>
          )}
        </div>
      </div>

      <div className="relative">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Comece a digitar... links de hotéis, passeios, dicas, custos previstos..."
          className="w-full min-h-[300px] bg-bg-elevated/50 border border-border-subtle rounded-2xl p-6 text-base text-text placeholder:text-text-subtle focus:outline-none focus:border-accent/50 focus:bg-bg-elevated transition-all resize-y leading-relaxed"
          style={{ whiteSpace: "pre-wrap" }}
        />
        <div className="absolute top-0 right-0 bottom-0 left-0 pointer-events-none rounded-2xl ring-1 ring-inset ring-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
}
