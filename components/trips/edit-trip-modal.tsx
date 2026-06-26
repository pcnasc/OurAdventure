"use client";

import { useState, useEffect } from "react";
import { Plane, MapPin, Calendar, Activity } from "lucide-react";
import { Modal } from "@/components/shared/modal";
import type { TripWithStats } from "@/lib/supabase/types";

interface EditTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: TripWithStats;
  onUpdate: (tripId: string, updates: any) => Promise<void>;
}

export function EditTripModal({ isOpen, onClose, trip, onUpdate }: EditTripModalProps) {
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    destination: "",
    startDate: "",
    endDate: "",
    status: "draft",
  });

  // Pre-fill fields
  useEffect(() => {
    if (isOpen && trip) {
      setFormData({
        name: trip.name || "",
        description: trip.description || "",
        destination: trip.destination || "",
        startDate: trip.start_date || "",
        endDate: trip.end_date || "",
        status: trip.status || "draft",
      });
    }
  }, [isOpen, trip]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Fallback: reverse geocode if destination changed and we need a new country code
    let finalCountryCode = trip.country_code;
    if (formData.destination !== trip.destination) {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(formData.destination)}&format=json&addressdetails=1&limit=1`);
        const data = await res.json();
        if (data && data[0] && data[0].address && data[0].address.country_code) {
          finalCountryCode = data[0].address.country_code.toUpperCase();
        }
      } catch (err) {
        console.error("Geocoding failed", err);
      }
    }

    await onUpdate(trip.id, {
      name: formData.name,
      description: formData.description,
      destination: formData.destination,
      start_date: formData.startDate || null,
      end_date: formData.endDate || null,
      status: formData.status,
      country_code: finalCountryCode,
    });
    
    setLoading(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Viagem">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs uppercase tracking-widest text-text-subtle font-medium mb-1.5">
            Nome da Viagem
          </label>
          <div className="relative">
            <Plane className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              required
              type="text"
              placeholder="Ex: Mochilão Chile 🇨🇱"
              className="w-full bg-bg-elevated border border-border-subtle rounded-xl py-2.5 pl-10 pr-4 text-sm text-text focus:outline-none focus:border-accent transition-colors"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-widest text-text-subtle font-medium mb-1.5">
            Descrição
          </label>
          <textarea
            placeholder="Ex: Explorar o Atacama, ver as estrelas e tomar pisco sour..."
            className="w-full bg-bg-elevated border border-border-subtle rounded-xl py-2.5 px-4 text-sm text-text focus:outline-none focus:border-accent transition-colors resize-none"
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-widest text-text-subtle font-medium mb-1.5">
            Destino (Cidades e País)
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              required
              type="text"
              placeholder="Ex: Santiago, Atacama — Chile"
              className="w-full bg-bg-elevated border border-border-subtle rounded-xl py-2.5 pl-10 pr-4 text-sm text-text focus:outline-none focus:border-accent transition-colors"
              value={formData.destination}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-widest text-text-subtle font-medium mb-1.5">
              Data de Início
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <input
                type="date"
                className="w-full bg-bg-elevated border border-border-subtle rounded-xl py-2.5 pl-10 pr-4 text-sm text-text focus:outline-none focus:border-accent transition-colors"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-text-subtle font-medium mb-1.5">
              Data de Fim
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <input
                type="date"
                className="w-full bg-bg-elevated border border-border-subtle rounded-xl py-2.5 pl-10 pr-4 text-sm text-text focus:outline-none focus:border-accent transition-colors"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-widest text-text-subtle font-medium mb-1.5">
            Status
          </label>
          <div className="relative">
            <Activity className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <select
              className="w-full bg-bg-elevated border border-border-subtle rounded-xl py-2.5 pl-10 pr-4 text-sm text-text focus:outline-none focus:border-accent transition-colors appearance-none"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="draft">Rascunho</option>
              <option value="planned">Planejado</option>
              <option value="active">Ativo</option>
              <option value="completed">Concluído</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>
        </div>

        <div className="pt-4 border-t border-border-subtle flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-text hover:text-accent transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-accent px-6 py-2 text-sm"
          >
            {loading ? "Salvando..." : "Salvar Alterações"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
