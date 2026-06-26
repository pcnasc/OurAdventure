"use client";

import { useState, useEffect } from "react";
import { Plane, MapPin, Calendar, Wallet } from "lucide-react";
import { Modal } from "@/components/shared/modal";

interface AddTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  countryName?: string;
  countryCode?: string;
  onAdd: (trip: any) => Promise<void>;
}

export function AddTripModal({ isOpen, onClose, countryName, countryCode, onAdd }: AddTripModalProps) {
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    country: "",
    cities: "",
    startDate: "",
    endDate: "",
    budget: "",
    currentCountryCode: "",
  });

  // Pre-fill destination if a country was clicked
  useEffect(() => {
    if (isOpen && countryName) {
      setFormData((prev) => ({ 
        ...prev, 
        country: countryName,
        currentCountryCode: countryCode || "" 
      }));
    }
  }, [isOpen, countryName, countryCode]);

  // Clear country code if they manually change the country drastically
  useEffect(() => {
    if (countryName && formData.country !== countryName) {
      setFormData((prev) => ({ ...prev, currentCountryCode: "" }));
    }
  }, [formData.country, countryName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Convert budget to cents
    const budgetTotal = formData.budget ? parseInt(formData.budget) * 100 : 0;
    const finalDestination = formData.cities 
      ? `${formData.cities} — ${formData.country}`
      : formData.country;

    await onAdd({
      name: formData.name,
      description: formData.description,
      destination: finalDestination,
      start_date: formData.startDate || null,
      end_date: formData.endDate || null,
      budget_total: budgetTotal,
      country_code: formData.currentCountryCode,
      status: "draft",
    });
    
    setLoading(false);
    onClose();
    // Reset form
    setFormData({ name: "", description: "", country: "", cities: "", startDate: "", endDate: "", budget: "", currentCountryCode: "" });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Planejar Nova Aventura">
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {countryName && (
          <div className="text-xs text-accent uppercase tracking-widest font-semibold mb-4 bg-accent/10 py-2 px-3 rounded-lg border border-accent/20 inline-block">
            🗺️ Destino selecionado: {countryName}
          </div>
        )}

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
            rows={2}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-widest text-text-subtle font-medium mb-1.5">
              País
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <input
                required
                type="text"
                placeholder="Ex: Chile"
                className="w-full bg-bg-elevated border border-border-subtle rounded-xl py-2.5 pl-10 pr-4 text-sm text-text focus:outline-none focus:border-accent transition-colors"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-text-subtle font-medium mb-1.5">
              Cidades (Opcional)
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <input
                type="text"
                placeholder="Ex: Santiago, Atacama"
                className="w-full bg-bg-elevated border border-border-subtle rounded-xl py-2.5 pl-10 pr-4 text-sm text-text focus:outline-none focus:border-accent transition-colors"
                value={formData.cities}
                onChange={(e) => setFormData({ ...formData, cities: e.target.value })}
              />
            </div>
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
            Orçamento Total (R$)
          </label>
          <div className="relative">
            <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              type="number"
              placeholder="Ex: 5000"
              className="w-full bg-bg-elevated border border-border-subtle rounded-xl py-2.5 pl-10 pr-4 text-sm text-text focus:outline-none focus:border-accent transition-colors"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
            />
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
            {loading ? "Salvando..." : "Criar Viagem"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
