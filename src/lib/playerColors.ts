// Персональные цвета игроков — обводка аватара и рамка работы, стабильны на
// весь матч. Индекс — позиция игрока в комнате (room.players), либо позиция
// в списке (рейтинг). Вне списка (шапка, профиль) — стабильный цвет по id.
export const PLAYER_COLORS = ["#6FF8C9", "#FF2F7E", "#FFD23F", "#8B5CF6", "#3B82F6"] as const;
export const PLAYER_COLORS_EXTRA = ["#F97316", "#22D3EE"] as const;
const ALL_PLAYER_COLORS = [...PLAYER_COLORS, ...PLAYER_COLORS_EXTRA];

export const playerColorByIndex = (index: number): string =>
  ALL_PLAYER_COLORS[((index % ALL_PLAYER_COLORS.length) + ALL_PLAYER_COLORS.length) % ALL_PLAYER_COLORS.length];

export const playerColorForId = (id: string): string => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return ALL_PLAYER_COLORS[hash % ALL_PLAYER_COLORS.length];
};
