"use client";

import { useState } from "react";
import { Wallet, Plus, Minus } from "lucide-react";
import { Modal } from "@/components/shared/modal";
import { formatMoney } from "@/lib/utils";

interface EditBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripId: string;
  currentBudgetTotal: number;
  currentBudgetSpent: number;
  currency: string;
  onUpdate: (total: number, spent: number) => Promise<void>;
}

export function EditBudgetModal({
  isOpen,
  onClose,
  currentBudgetTotal,
  currentBudgetSpent,
  currency,
  onUpdate,
}: EditBudgetModalProps) {
  const [loading, setLoading] = useState(false);
  
  // States in standard currency units (not cents) for easier editing
  const [total, setTotal] = useState(String(currentBudgetTotal / 100));
  const [spent, setSpent] = useState(String(currentBudgetSpent / 100));
  
  const [addExpense, setAddExpense] = useState("");

  const handleAddExpense = () => {
    if (!addExpense) return;
    const current = parseFloat(spent || "0");
    const toAdd = parseFloat(addExpense);
    setSpent(String(current + toAdd));
    setAddExpense("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Convert back to cents for DB
    const finalTotal = Math.round(parseFloat(total || "0") * 100);
    const finalSpent = Math.round(parseFloat(spent || "0") * 100);

    await onUpdate(finalTotal, finalSpent);
    
    setLoading(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Atualizar Orçamento">
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Quick Add Expense */}
        <div className="p-4 rounded-xl" style={{ background: "hsl(220 16% 14%)" }}>
          <label className="block text-xs uppercase tracking-widest text-text-subtle font-medium mb-2">
            Adicionar Gasto (R$)
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Plus className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <input
                type="number"
                placeholder="Ex: 150"
                className="w-full bg-bg-elevated border border-border-subtle rounded-xl py-2.5 pl-10 pr-4 text-sm text-text focus:outline-none focus:border-accent transition-colors"
                value={addExpense}
                onChange={(e) => setAddExpense(e.target.value)}
              />
            </div>
            <button
              type="button"
              onClick={handleAddExpense}
              className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-accent hover:text-accent-hover transition-colors rounded-lg bg-accent/10 hover:bg-accent/20"
            >
              Somar
            </button>
          </div>
        </div>

        {/* Manual Overrides */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-widest text-text-subtle font-medium mb-1.5">
              Total Gasto
            </label>
            <div className="relative">
              <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <input
                required
                type="number"
                className="w-full bg-bg-elevated border border-border-subtle rounded-xl py-2.5 pl-10 pr-4 text-sm text-text focus:outline-none focus:border-accent transition-colors"
                value={spent}
                onChange={(e) => setSpent(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-text-subtle font-medium mb-1.5">
              Teto do Orçamento
            </label>
            <div className="relative">
              <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <input
                required
                type="number"
                className="w-full bg-bg-elevated border border-border-subtle rounded-xl py-2.5 pl-10 pr-4 text-sm text-text focus:outline-none focus:border-accent transition-colors"
                value={total}
                onChange={(e) => setTotal(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="text-center p-3 rounded-lg border border-border-subtle bg-bg-elevated/50">
          <p className="text-xs text-text-subtle uppercase tracking-wider mb-1">Status Final</p>
          <p className="font-mono text-sm text-accent">
            {formatMoney(Math.round(parseFloat(spent || "0") * 100), currency)} / {formatMoney(Math.round(parseFloat(total || "0") * 100), currency)}
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
            className="btn-accent px-6 py-2 text-sm"
          >
            {loading ? "Salvando..." : "Atualizar"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
