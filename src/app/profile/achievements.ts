import { ACHIEVEMENT_THRESHOLDS as T } from "./constants";
import type { Achievement, ProfileData } from "./types";

export const buildAchievements = (p: ProfileData): Achievement[] => [
  {
    id: "first_match",
    icon: "brush",
    label: "Первый рисунок",
    description: "Сыграйте свой первый матч",
    unlocked: p.matchesPlayed >= T.firstMatch,
  },
  {
    id: "veteran",
    icon: "brush",
    label: "Ветеран",
    description: `Сыграйте ${T.veteranMatches} матчей`,
    unlocked: p.matchesPlayed >= T.veteranMatches,
  },
  {
    id: "master",
    icon: "brush",
    label: "Мастер кисти",
    description: `Сыграйте ${T.masterMatches} матчей`,
    unlocked: p.matchesPlayed >= T.masterMatches,
  },
  {
    id: "first_win",
    icon: "trophy",
    label: "Первая победа",
    description: "Выиграйте раунд",
    unlocked: p.wins >= T.firstWin,
  },
  {
    id: "pro",
    icon: "trophy",
    label: "Профи",
    description: `Выиграйте ${T.proWins} раз`,
    unlocked: p.wins >= T.proWins,
  },
  {
    id: "legend",
    icon: "trophy",
    label: "Легенда",
    description: `Выиграйте ${T.legendWins} раз`,
    unlocked: p.wins >= T.legendWins,
  },
  {
    id: "level5",
    icon: "arrow",
    label: "5 уровень",
    description: "Достигните 5 уровня",
    unlocked: p.level >= T.level5,
  },
  {
    id: "level10",
    icon: "arrow",
    label: "10 уровень",
    description: "Достигните 10 уровня",
    unlocked: p.level >= T.level10,
  },
];

export const FEATURED_ACHIEVEMENT_IDS = ["first_match", "first_win", "level5"];
