export interface Transaction {
  name: string;
  amount: number;
  baseDate: string; // Store as ISO string
  recurrence: RecurrencePattern;
}

export type RecurrencePattern = OneTime | Recurring;

export interface OneTime {
  type: 'ONE_TIME';
}

export interface Recurring {
  type: 'RECURRING';
  interval: number;
  unit: 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';
}

export const isTransactionApplicable = (transaction: Transaction, givenDate: Date): boolean => {
  const baseDate = new Date(transaction.baseDate);
  
  if (transaction.recurrence.type === 'ONE_TIME') {
    return (
      baseDate.getFullYear() === givenDate.getFullYear() &&
      baseDate.getMonth() === givenDate.getMonth() &&
      baseDate.getDate() === givenDate.getDate()
    );
  }

  const { interval, unit } = transaction.recurrence;
  const daysDiff = Math.floor((givenDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));

  switch (unit) {
    case 'DAY':
      return daysDiff % interval === 0;
    case 'WEEK':
      return daysDiff % (interval * 7) === 0;
    case 'MONTH': // NOT SURE
      // if (daysDiff % 30 !== 0) return false;
      const monthsDiff = (givenDate.getFullYear() - baseDate.getFullYear()) * 12 + givenDate.getMonth() - baseDate.getMonth();
      return monthsDiff % interval === 0 && baseDate.getDate() === givenDate.getDate();
    case 'YEAR':
      return (
        givenDate.getMonth() === baseDate.getMonth() &&
        givenDate.getDate() === baseDate.getDate() &&
        (givenDate.getFullYear() - baseDate.getFullYear()) % interval === 0
      );
    default:
      return false;
  }
};

export const getEstimatedCashflowForDateRange = (transactions: Transaction[], endDate: Date): { date: string; amount: number }[] => {
  const cashflow: { date: string; amount: number }[] = [];
  const earliestTransactionDate = transactions.reduce<Date | undefined>((earliest, t) => {
    const baseDate = new Date(t.baseDate);
    return earliest ? (baseDate < earliest ? baseDate : earliest) : baseDate;
  }, undefined);
  if (!earliestTransactionDate) return cashflow;

  let currentDate = new Date(earliestTransactionDate);
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
