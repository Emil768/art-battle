export const DEFAULT_COLOR = "#241a3d";
export const DEFAULT_LINE_WIDTH = 5;
export const ACTIVITY_PING_THROTTLE_MS = 800;
export const STATUS_MESSAGE_DURATION_MS = 4000;

// Толщина по умолчанию для каждого инструмента (кисть — толще маркера).
export const LINE_WIDTH_BY_MODE: Record<"pencil" | "pen", number> = {
  pencil: 9,
  pen: 5,
};
