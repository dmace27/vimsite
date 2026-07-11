"use client";
import { useEffect, useState } from "react";
import type { SiteSettings } from "@/types/site";

const defaults: SiteSettings = { contrast: "soft", accent: "green", reducedMotion: false, showHints: true };
export function useLocalSettings() {
  const [settings, setSettings] = useState<SiteSettings>(() => {
    if (typeof window === "undefined") return defaults;
    try { const saved = localStorage.getItem("portfolio-settings"); return saved ? { ...defaults, ...JSON.parse(saved) } : defaults; } catch { return defaults; }
  });
  useEffect(() => {
    document.documentElement.dataset.contrast = settings.contrast;
    document.documentElement.dataset.accent = settings.accent;
    document.documentElement.dataset.motion = settings.reducedMotion ? "reduced" : "full";
    localStorage.setItem("portfolio-settings", JSON.stringify(settings));
  }, [settings]);
  return { settings, setSettings };
}
