"use client";

import { useState } from "react";

export const CopyLinkButton = ({ userId }: { userId: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      const url = `${window.location.origin}/profile/${userId}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // буфер обмена недоступен (нет разрешения/не https) — молча пропускаем
    }
  };

  return (
    <button onClick={handleCopy} className="ab-btn ab-btn-secondary w-full">
      {copied ? "Скопировано ✓" : "Скопировать ссылку"}
    </button>
  );
};
