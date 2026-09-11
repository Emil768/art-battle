// Через сколько след полностью гаснет и стирается (мс).
export const TRAIL_LIFETIME_MS = 2000;
export const TRAIL_LINE_WIDTH = 4;

// Цвет следа для каждого стиля курсора: [r, g, b].
export const TRAIL_COLOR_BY_STYLE: Record<string, [number, number, number]> = {
  fire: [255, 122, 24],
  default: [255, 255, 255],
};
