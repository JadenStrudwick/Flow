export interface Transaction {
  name: string;
  amount: number;
  baseDate: string; // Store as ISO string
  interval: 'ONCE' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
}

export const isTransactionApplicable = (transaction: Transaction, givenDate: Date): boolean => {
  const baseDate = new Date(transaction.baseDate);
  
  switch (transaction.interval) {
    case "ONCE":
      return (
        baseDate.getFullYear() === givenDate.getFullYear() &&
        baseDate.getMonth() === givenDate.getMonth() &&
        baseDate.getDate() === givenDate.getDate()
      );
    case "DAILY":
      return true;
    case "WEEKLY":
      const daysDiff = Math.floor((givenDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff % 7 === 0;
    case "MONTHLY":
      return baseDate.getDate() === givenDate.getDate();
    case "YEARLY":
      return baseDate.getMonth() === givenDate.getMonth() && baseDate.getDate() === givenDate.getDate();
    default:
      return false;
  }
};

export const getEstimatedCashflowForDateRange = (transactions: Transaction[], endDate: Date): { date: string; amount: number }[] => {
  const cashflow: { date: string; amount: number }[] = [];
  let currentDate = new Date();
  let currentBalance = 0;

  while (currentDate <= endDate) {
    const applicableTransactions = transactions.filter(t => isTransactionApplicable(t, currentDate));
    const dailyAmount = applicableTransactions.reduce((sum, t) => sum + t.amount, 0);
    currentBalance += dailyAmount;

    cashflow.push({
      date: currentDate.toISOString(),
      amount: currentBalance
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return cashflow;
};