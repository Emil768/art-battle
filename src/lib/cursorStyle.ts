export type CursorStyleId = "fire" | "default";

export interface CursorStyleOption {
  id: CursorStyleId;
  label: string;
  emoji: string;
}

// Список стандартных вариантов курсора. Сейчас реализован только "fire",
// остальные добавляются сюда же по мере готовности эффектов.
export const CURSOR_STYLES: CursorStyleOption[] = [
  { id: "fire", label: "Огонь", emoji: "🔥" },
  { id: "default", label: "Обычный", emoji: "🖱️" },
];

export const DEFAULT_CURSOR_STYLE: CursorStyleId = "fire";

const STORAGE_KEY = "art-battle:cursor-style";
const CHANGE_EVENT = "art-battle:cursor-style-change";

const isCursorStyleId = (v: unknown): v is CursorStyleId => v === "fire" || v === "default";

export const loadStoredCursorStyle = (): CursorStyleId => {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (isCursorStyleId(v)) return v;
  } catch {
    // localStorage unavailable — fall through to default
  }
  return DEFAULT_CURSOR_STYLE;
};

export const storeCursorStyle = (style: CursorStyleId) => {
  try {
    localStorage.setItem(STORAGE_KEY, style);
  } catch {
    // localStorage unavailable (private mode, blocked) — silently skip persistence
  }
  window.dispatchEvent(new CustomEvent<CursorStyleId>(CHANGE_EVENT, { detail: style }));
};

export const subscribeCursorStyle = (callback: (style: CursorStyleId) => void) => {
  const handler = (e: Event) => callback((e as CustomEvent<CursorStyleId>).detail);
  window.addEventListener(CHANGE_EVENT, handler);
  return () => window.removeEventListener(CHANGE_EVENT, handler);
};
