"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckSquare, Loader2 } from "lucide-react";
import { Navbar } from "@/components/shared/navbar";
import { ChecklistCard } from "@/components/checklist/checklist-card";
import { supabase } from "@/lib/supabase/client";
import { countryFlag } from "@/lib/utils";

export default function ChecklistsPage() {
  const [groupedChecklists, setGroupedChecklists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const { data } = await supabase
      .from('checklists')
      .select('*, items:checklist_items(*), trip:trips(id, name, country_code)')
      .order('sort_order', { ascending: true });

    if (data) {
      const groupsMap = new Map();
      data.forEach(cl => {
        if (cl.items) {
          cl.items.sort((a: any, b: any) => a.sort_order - b.sort_order);
        }
        
        const tripId = cl.trip_id;
        if (!groupsMap.has(tripId)) {
          groupsMap.set(tripId, {
            id: tripId,
            title: cl.trip?.name || "Aventura Desconhecida",
            emoji: countryFlag(cl.trip?.country_code || "XX"),
            checklists: []
          });
        }
        groupsMap.get(tripId).checklists.push(cl);
      });
      setGroupedChecklists(Array.from(groupsMap.values()));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();

    const channel = supabase.channel('global_checklist_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'checklist_items' }, () => {
        fetchData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'checklists' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  return (
    <>
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 sm:px-6 pt-24 pb-28 sm:pb-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-8"
        >
          <CheckSquare className="h-6 w-6 text-accent" />
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-text">
            Checklists
          </h1>
        </motion.div>

        {/* Loading state */}
        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 text-accent animate-spin" />
          </div>
        )}

        {/* Empty state */}
        {!loading && groupedChecklists.length === 0 && (
          <div className="text-center py-12 text-text-muted">
            <p>Nenhum checklist criado ainda.</p>
          </div>
        )}

        {/* Checklist groups */}
        {!loading && (
          <div className="space-y-10">
            {groupedChecklists.map((group, groupIdx) => (
              <motion.section
                key={group.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: groupIdx * 0.1 }}
              >
                <h2 className="text-xs uppercase tracking-widest text-text-subtle font-semibold mb-4 flex items-center gap-2">
                  <span>{group.emoji}</span>
                  {group.title}
                </h2>
                <div className="space-y-3">
                  {group.checklists.map((cl: any) => (
                    <ChecklistCard key={cl.id} checklist={cl} />
                  ))}
                </div>
              </motion.section>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
