"use client";
import { useState } from "react";
import { profile } from "@/data/site-content";
export function ContactPanel() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const send = (event: React.FormEvent) => {
    event.preventDefault();
    const subject = encodeURIComponent(`Portfolio note from ${name || "a visitor"}`);
    const body = encodeURIComponent(`${message}\n\nFrom: ${name} <${email}>`);
    window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`;
  };
  return (
    <div className="contact-grid">
      <div>
        <h2>Elsewhere</h2>
        <p>
          The best conversations usually start with a specific question, a half-formed idea, or
          something worth making better.
        </p>
        <div className="social-links">
          {profile.socials.map((item) => (
            <a
              key={item.label}
              href={item.href}
              target={item.href.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
              data-vim-item
            >
              <span>{item.label}</span>
              <span>↗</span>
            </a>
          ))}
        </div>
      </div>
      <form onSubmit={send}>
        <label>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Message
          <textarea
            rows={6}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
        </label>
        <button type="submit">
          Open in email client <span>→</span>
        </button>
        <small>No data is stored. This opens your default email application.</small>
      </form>
    </div>
  );
}
