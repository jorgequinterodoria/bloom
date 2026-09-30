"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { HeartHandshake, PhoneCall, Sparkles, X } from "lucide-react";
import { useEffect } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function SOSModal({ open, onClose }: Props) {
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

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
            autoFocus
            onClick={onClose}
            className="absolute right-4 top-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted text-ink-muted"
          >
            <X className="h-6 w-6" aria-hidden />
          </button>

          <p className="sr-only">
            Respira siguiendo el círculo: inhala lentamente y exhala despacio.
          </p>

          <div className="flex flex-1 items-center justify-center">
            <motion.div
              aria-hidden
              animate={reduce ? {} : { scale: [1, 1.3, 1] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="h-48 w-48 rounded-full bg-accent-soft ring-8 ring-accent/40"
            />
          </div>

          <div className="rounded-t-3xl bg-surface p-6 shadow-[0_-8px_40px_rgba(0,0,0,0.06)]">
            <h2 className="font-serif text-2xl text-ink">Modo calma</h2>
            <p className="mt-3 leading-relaxed text-ink-muted">
              Si necesitas apoyo ahora mismo, puedes respirar, pedir compañía o tomar una pausa breve sin culpa.
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <button type="button" onClick={onClose} className="rounded-2xl bg-primary-soft p-3 text-left text-sm text-ink">
                <HeartHandshake className="mb-2 h-5 w-5 text-primary-deep" aria-hidden />
                Hablar con alguien
              </button>
              <button type="button" onClick={onClose} className="rounded-2xl bg-accent-soft p-3 text-left text-sm text-ink">
                <Sparkles className="mb-2 h-5 w-5 text-bloom" aria-hidden />
                Respirar conmigo
              </button>
              <button type="button" onClick={onClose} className="rounded-2xl bg-surface-muted p-3 text-left text-sm text-ink">
                <PhoneCall className="mb-2 h-5 w-5 text-ink-muted" aria-hidden />
                Apoyo externo
              </button>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-ink-muted">
              Prueba un batido de plátano con proteína: plátano, una cucharada de proteína en polvo, leche o agua y unas nueces. Dulce, suave y sin prisa.
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
