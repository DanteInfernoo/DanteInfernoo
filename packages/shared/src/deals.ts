export interface ForecastDeal {
  value: number;
  status: string;
  stage_id: string;
}

export interface ForecastStage {
  id: string;
  probability: number;
}

export function weightedForecast(
  deals: ForecastDeal[],
  stages: ForecastStage[],
): number {
  const probabilityByStage = new Map(stages.map((s) => [s.id, s.probability]));
  return deals
    .filter((d) => d.status === "open")
    .reduce((sum, d) => {
      const probability = probabilityByStage.get(d.stage_id) ?? 0;
      return sum + (d.value * probability) / 100;
    }, 0);
}

export function daysSince(isoDate: string): number {
  const ms = Date.now() - new Date(isoDate).getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

export function isStageRotten(
  stageEnteredAt: string,
  rottenDays: number | null,
): boolean {
  if (rottenDays === null) return false;
  return daysSince(stageEnteredAt) > rottenDays;
}
