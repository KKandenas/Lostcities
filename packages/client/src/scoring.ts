import { scoreExpedition, COLORS, type Color, type Card } from "@lostcities/shared";

export function totalScore(expeditions: Record<Color, Card[]>): number {
  return COLORS.reduce((sum, color) => sum + scoreExpedition(color, expeditions[color]).score, 0);
}
