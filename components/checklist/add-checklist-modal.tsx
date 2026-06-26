"use client";

import { useState } from "react";
import { CheckSquare, ListPlus, ScrollText, MapPin, Bike, Briefcase, Camera } from "lucide-react";
import { Modal } from "@/components/shared/modal";

const ICONS = [
  { id: "check-square", icon: CheckSquare, label: "Checklist" },
  { id: "scroll-text", icon: ScrollText, label: "Documentos" },
  { id: "map-pin", icon: MapPin, label: "Destinos" },
  { id: "bike", icon: Bike, label: "Atividades" },
  { id: "briefcase", icon: Briefcase, label: "Bagagem" },
  { id: "camera", icon: Camera, label: "Equipamentos" },
];

interface AddChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: any) => Promise<void>;
}

export function AddChecklistModal({ isOpen, onClose, onAdd }: AddChecklistModalProps) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("check-square");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onAdd({ name, description, icon: selectedIcon });
    setLoading(false);
    setName("");
    setDescription("");
    setSelectedIcon("check-square");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nova Lista">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs uppercase tracking-widest text-text-subtle font-medium mb-1.5">
            Nome da Lista
          </label>
          <div className="relative">
            <ListPlus className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              required
              type="text"
              placeholder="Ex: Roupas de Frio"
              className="w-full bg-bg-elevated border border-border-subtle rounded-xl py-2.5 pl-10 pr-4 text-sm text-text focus:outline-none focus:border-accent transition-colors"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-widest text-text-subtle font-medium mb-1.5">
            Descrição (Opcional)
          </label>
          <input
            type="text"
            placeholder="Ex: Não esquecer as blusas térmicas"
            className="w-full bg-bg-elevated border border-border-subtle rounded-xl py-2.5 px-4 text-sm text-text focus:outline-none focus:border-accent transition-colors"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-widest text-text-subtle font-medium mb-3">
            Ícone
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {ICONS.map((i) => {
              const Icon = i.icon;
              const isSelected = selectedIcon === i.id;
              return (
                <button
                  key={i.id}
                  type="button"
                  onClick={() => setSelectedIcon(i.id)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                    isSelected 
                      ? "border-accent bg-accent/10 text-accent" 
                      : "border-border-subtle bg-bg-elevated/50 text-text-subtle hover:text-text hover:bg-bg-hover"
                  }`}
                  title={i.label}
                >
                  <Icon className="h-5 w-5" />
                </button>
              );
            })}
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
            disabled={loading || !name}
            className="btn-accent px-6 py-2 text-sm"
          >
            {loading ? "Criando..." : "Criar Lista"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
