"use client";

import { useState } from "react";

export function CopyLink() {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const node = document.createElement("textarea");
      node.value = url;
      document.body.appendChild(node);
      node.select();
      document.execCommand("copy");
      node.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="rounded-xl border border-line bg-elev px-3 py-2 text-sm text-muted hover:border-accent/40 hover:text-ink"
      aria-live="polite"
    >
      {copied ? "Copied" : "Copy link"}
    </button>
  );
}
