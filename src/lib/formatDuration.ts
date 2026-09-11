export const pluralRu = (n: number, one: string, few: string, many: string) => {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)) return few;
  return many;
};

// Текст в интерфейсе всегда должен совпадать с реальными DRAWING_SECONDS/
// VOTING_SECONDS — форматируем из них, а не хардкодим "10 минут" отдельно.
// Именительный падеж — для подписей-лейблов ("одно задание, 10 минут").
export const formatDurationRu = (totalSeconds: number): string => {
  if (totalSeconds < 60) {
    return `${totalSeconds} ${pluralRu(totalSeconds, "секунда", "секунды", "секунд")}`;
  }
  const minutes = Math.round(totalSeconds / 60);
  return `${minutes} ${pluralRu(minutes, "минута", "минуты", "минут")}`;
};

// Винительный падеж — для глагольных конструкций ("10 минут рисуем").
export const formatDurationAccusativeRu = (totalSeconds: number): string => {
  if (totalSeconds < 60) {
    return `${totalSeconds} ${pluralRu(totalSeconds, "секунду", "секунды", "секунд")}`;
  }
  const minutes = Math.round(totalSeconds / 60);
  return `${minutes} ${pluralRu(minutes, "минуту", "минуты", "минут")}`;
};
