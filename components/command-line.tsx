"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { commands } from "@/data/commands";

export function CommandLine({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const ref = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  useEffect(() => ref.current?.focus(), []);
  const run = () => {
    const name = value.trim().replace(/^:/, "").toLowerCase();
    const hit = commands.find((item) => item.label.replace(" me", "") === name);
    if (hit) {
      router.push(hit.href);
      onClose();
    } else setError(`E492: Not an editor command: ${name || "…"}`);
  };
  return (
    <div className="command-wrap" role="dialog" aria-modal="true" aria-label="Command line">
      <div className="command-error">{error}</div>
      <div className="command-input">
        <span>:</span>
        <input
          ref={ref}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError("");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") run();
            if (e.key === "Escape") onClose();
          }}
          aria-label="Command"
          placeholder="help"
        />
        <button onClick={run}>run</button>
      </div>
    </div>
  );
}
