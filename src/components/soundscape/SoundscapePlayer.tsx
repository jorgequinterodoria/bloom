"use client";

import { CloudRain, Moon, Music2, Trees, Waves } from "lucide-react";
import { useEffect, useState } from "react";
import { startSoundscape, stopSoundscape, type SoundscapeName } from "@/lib/soundscapes";
import { useI18n } from "@/lib/i18n";

const options: Array<{ id: SoundscapeName; icon: typeof CloudRain; key: string }> = [
  { id: "rain", icon: CloudRain, key: "soundRain" },
  { id: "ocean", icon: Waves, key: "soundOcean" },
  { id: "forest", icon: Trees, key: "soundForest" },
  { id: "night", icon: Moon, key: "soundNight" },
];

export function SoundscapePlayer() {
  const { t } = useI18n();
  const [active, setActive] = useState<SoundscapeName | null>(null);
  const [volume, setVolume] = useState(0.16);

  useEffect(() => () => stopSoundscape(), []);

  function toggle(name: SoundscapeName) {
    if (active === name) {
      stopSoundscape();
      setActive(null);
      return;
    }
    if (startSoundscape(name, volume)) { setActive(name); void fetch("/api/events", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ event: "soundscape_started" }) }); }
  }

  useEffect(() => {
    if (!active) return;
    startSoundscape(active, volume);
  }, [active, volume]);

  return (
    <section className="rounded-[30px] bg-surface-muted p-5">
      <div className="flex items-center gap-2"><Music2 className="h-5 w-5 text-bloom" aria-hidden /><div><h2 className="font-serif text-2xl text-ink">{t("soundscapesTitle")}</h2><p className="mt-1 text-xs text-ink-muted">{t("soundscapesSubtitle")}</p></div></div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {options.map(({ id, icon: Icon, key }) => (
          <button key={id} type="button" onClick={() => toggle(id)} aria-pressed={active === id} className={`flex min-h-14 items-center gap-3 rounded-2xl px-4 text-left transition ${active === id ? "bg-primary text-surface" : "bg-surface text-ink"}`}>
            <Icon className="h-5 w-5 shrink-0" aria-hidden />
            <span className="text-sm font-medium">{t(key)}</span>
          </button>
        ))}
      </div>
      <label className="mt-4 block text-xs text-ink-muted">
        <span className="flex items-center justify-between"><span>{t("soundVolume")}</span><span>{Math.round(volume * 100)}%</span></span>
        <input className="mt-2 w-full accent-[var(--color-primary)]" type="range" min="0.03" max="0.28" step="0.01" value={volume} onChange={(event) => setVolume(Number(event.target.value))} />
      </label>
    </section>
  );
}
