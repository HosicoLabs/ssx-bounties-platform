import { BountyPrize } from "@/app/types"

export const calculateTotalPrize = (bountyPrizes: BountyPrize[]) => {
  return bountyPrizes.reduce((total, position) => {
    return total + (Number.parseFloat(position.prize.toString()) || 0)
  }, 0).toLocaleString()
}


export const isEnded = (iso?: string | null) => {
  if (!iso) return false;
  const t = new Date(iso).getTime();
  return Number.isFinite(t) && t < Date.now();
};
