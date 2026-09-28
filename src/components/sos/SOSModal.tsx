"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function SOSModal({ open, onClose }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col bg-surface/70 backdrop-blur-xl"
          role="dialog"
          aria-modal="true"
          aria-label="Modo calma"
        >
          <button
            type="button"
            aria-label="Cerrar"
            onClick={onClose}
            className="absolute right-4 top-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted text-ink-muted"
          >
            <X className="h-6 w-6" aria-hidden />
          </button>

          {/* Mitad superior: círculo de respiración (3 minutos) */}
          <div className="flex flex-1 items-center justify-center">
            <motion.div
              aria-hidden
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="h-48 w-48 rounded-full bg-accent-soft ring-8 ring-accent/40"
            />
          </div>

          {/* Mitad inferior: sugerencia */}
          <div className="rounded-t-3xl bg-surface p-6 shadow-[0_-8px_40px_rgba(0,0,0,0.06)]">
            <h2 className="font-serif text-2xl text-ink">
              Sugerencia de consuelo
            </h2>
            <p className="mt-3 leading-relaxed text-ink-muted">
              Prueba un batido de plátano con proteína: plátano, una cucharada
              de proteína en polvo, leche o agua y unas nueces. Dulce, suave y
              sin prisa.
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
