import { roundCurrency } from "@/lib/format";

export interface SeatDeltaInput {
  seats: number;
  currentSeatPrice: number;
  targetSeatPrice: number;
}

export interface RightsizeInput {
  currentSeats: number;
  targetSeats: number;
  currentSeatPrice: number;
}

export function clampSavings(value: number): number {
  return roundCurrency(Math.max(value, 0));
}

export function computeSeatDeltaSavings(input: SeatDeltaInput): number {
  const monthlyDelta = (input.currentSeatPrice - input.targetSeatPrice) * input.seats;
  return clampSavings(monthlyDelta);
}

export function computeSwitchSavings(currentMonthlyCost: number, targetMonthlyCost: number): number {
  return clampSavings(currentMonthlyCost - targetMonthlyCost);
}

export function computeRightsizeSavings(input: RightsizeInput): number {
  const removableSeats = Math.max(input.currentSeats - input.targetSeats, 0);
  return clampSavings(removableSeats * input.currentSeatPrice);
}

export function computeCreditsSavings(currentMonthlyCost: number, creditRate = 0.2): number {
  return clampSavings(currentMonthlyCost * creditRate);
}

export function computeCurrentMonthlyCost(monthlySpend: number): number {
  return roundCurrency(monthlySpend);
}

export function computeAnnualSavings(monthlySavings: number): number {
  return roundCurrency(monthlySavings * 12);
}
