"use client";

import { useState, useEffect } from "react";
import { Plane, AlertCircle } from "lucide-react";
import { Modal } from "@/components/shared/modal";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface AddFlightAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddFlightAlertModal({ isOpen, onClose }: AddFlightAlertModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [trips, setTrips] = useState<any[]>([]);

  const [tripId, setTripId] = useState("");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");

  useEffect(() => {
    if (isOpen) {
      supabase.from("trips").select("id, name").order("start_date").then(({ data }) => {
        if (data) {
          setTrips(data);
          if (data.length > 0) setTripId(data[0].id);
        }
      });
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripId) return;

    setLoading(true);

    const priceInCents = Math.round(parseFloat(targetPrice) * 100);

    const { error } = await supabase.from("flight_alerts").insert({
      trip_id: tripId,
      origin_iata: origin.toUpperCase(),
      destination_iata: destination.toUpperCase(),
      target_price: priceInCents,
      departure_date: departureDate,
      return_date: returnDate || null,
      status: "active",
    });

    setLoading(false);

    if (!error) {
      router.refresh();
      onClose();
    } else {
      console.error(error);
      alert("Erro ao criar alerta de voo.");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Novo Alerta de Voo">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs uppercase tracking-widest text-text-subtle font-medium mb-1.5">
            Viagem
          </label>
          <select
            required
            className="w-full bg-bg-elevated border border-border-subtle rounded-xl py-2.5 px-4 text-sm text-text focus:outline-none focus:border-accent transition-colors appearance-none"
            value={tripId}
            onChange={(e) => setTripId(e.target.value)}
          >
            {trips.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-widest text-text-subtle font-medium mb-1.5">
              Origem (IATA)
            </label>
            <input
              required
              type="text"
              placeholder="GRU"
              maxLength={3}
              className="w-full bg-bg-elevated border border-border-subtle rounded-xl py-2.5 px-4 text-sm text-text focus:outline-none focus:border-accent transition-colors uppercase"
              value={origin}
              onChange={(e) => setOrigin(e.target.value.toUpperCase())}
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-text-subtle font-medium mb-1.5">
              Destino (IATA)
            </label>
            <input
              required
              type="text"
              placeholder="CDG"
              maxLength={3}
              className="w-full bg-bg-elevated border border-border-subtle rounded-xl py-2.5 px-4 text-sm text-text focus:outline-none focus:border-accent transition-colors uppercase"
              value={destination}
              onChange={(e) => setDestination(e.target.value.toUpperCase())}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-widest text-text-subtle font-medium mb-1.5">
              Data de Ida
            </label>
            <input
              required
              type="date"
              className="w-full bg-bg-elevated border border-border-subtle rounded-xl py-2.5 px-4 text-sm text-text focus:outline-none focus:border-accent transition-colors"
              value={departureDate}
              onChange={(e) => setDepartureDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-text-subtle font-medium mb-1.5">
              Data de Volta (Opcional)
            </label>
            <input
              type="date"
              className="w-full bg-bg-elevated border border-border-subtle rounded-xl py-2.5 px-4 text-sm text-text focus:outline-none focus:border-accent transition-colors"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-widest text-text-subtle font-medium mb-1.5">
            Preço Alvo / Budget (R$)
          </label>
          <input
            required
            type="number"
            placeholder="Ex: 3500"
            className="w-full bg-bg-elevated border border-border-subtle rounded-xl py-2.5 px-4 text-sm text-text focus:outline-none focus:border-accent transition-colors"
            value={targetPrice}
            onChange={(e) => setTargetPrice(e.target.value)}
          />
        </div>

        <div className="p-3 bg-accent/10 border border-accent/20 rounded-xl flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
          <p className="text-xs text-text-muted leading-relaxed">
            Assim que você criar, nosso robô escrito em Go começará a raspar dados de preço para essa rota todos os dias.
          </p>
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
            className="btn-accent px-6 py-2 text-sm flex items-center gap-2"
          >
            {loading ? "Criando..." : "Começar a Caçada"}
            <Plane className="h-4 w-4" />
          </button>
        </div>
      </form>
    </Modal>
  );
}
