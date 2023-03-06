export function calculateTransactionRewards(amount) {
  let rewards = 0;
  if (amount > 100) {
    return 2 * (amount - 100) + 50;
  }
  if (amount <= 100 && amount > 50) {
    return amount - 50;
  }

  return rewards;
}
