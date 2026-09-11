"use client";

import { CHANGELOG, CURRENT_VERSION } from "./constants";
import { useVersionBadge } from "./hooks/useVersionBadge";

export const VersionBadge = () => {
  const { open, openModal, closeModal } = useVersionBadge();

  return (
    <>
      <button
        onClick={openModal}
        className="ab-mono text-xs font-medium"
        style={{ color: "var(--ab-ink-30)" }}
      >
        v{CURRENT_VERSION}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/60 p-4 sm:items-center sm:justify-center">
          <div
            className="flex max-h-full w-full max-w-lg flex-col overflow-hidden rounded-[20px]"
            style={{ background: "var(--ab-surface-solid)", border: "2px solid var(--ab-line-soft)" }}
          >
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: "2px solid var(--ab-line)" }}
            >
              <h2 className="ab-display text-lg font-extrabold" style={{ color: "var(--ab-ink)" }}>
                Что нового
              </h2>
              <button
                onClick={closeModal}
                className="text-2xl"
                style={{ color: "var(--ab-ink-55)" }}
              >
                ✕
              </button>
            </div>
            <div className="flex-1 space-y-6 overflow-y-auto p-5">
              {CHANGELOG.map((entry) => (
                <div key={entry.version}>
                  <p className="font-extrabold" style={{ color: "var(--ab-ink)" }}>
                    v{entry.version}{" "}
                    <span className="ab-mono text-xs font-normal" style={{ color: "var(--ab-ink-45)" }}>
                      {entry.date}
                    </span>
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {entry.items.map((item, i) => (
                      <li key={i} className="text-sm font-semibold" style={{ color: "var(--ab-ink-55)" }}>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
