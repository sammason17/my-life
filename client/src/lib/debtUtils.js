export const MAX_SIMULATION_MONTHS = 600; // 50 years sanity check

export function calculateCurrentState(card) {
  // Initial state
  const initialTransferTotal = card.balanceTransfers.reduce((sum, bt) => sum + bt.amount, 0);
  let aprBalance = Math.max(0, card.totalDebt - initialTransferTotal);
  
  let activeTransfers = card.balanceTransfers.map(bt => ({
    ...bt,
    currentBalance: bt.amount,
    endDate: new Date(bt.endDate)
  }));

  let currentMonthlyPayment = card.monthlyPayment;

  // Set base date (defaulting missing or old dates to April 30, 2026)
  let baseDate = new Date(card.updatedAt || card.createdAt || '2026-04-30T00:00:00Z');
  const defaultDate = new Date('2026-04-30T00:00:00Z');
  if (baseDate < defaultDate) baseDate = defaultDate;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let simulationDate = new Date(baseDate);
  simulationDate.setHours(0, 0, 0, 0);

  while (true) {
    let nextYear = simulationDate.getFullYear();
    let nextMonth = simulationDate.getMonth();
    
    let lastDayOfMonth = new Date(nextYear, nextMonth + 1, 0).getDate();
    let targetDay = Math.min(card.paymentDate || 1, lastDayOfMonth);

    if (simulationDate.getDate() >= targetDay) {
      nextMonth++;
      if (nextMonth > 11) {
        nextMonth = 0;
        nextYear++;
      }
      lastDayOfMonth = new Date(nextYear, nextMonth + 1, 0).getDate();
      targetDay = Math.min(card.paymentDate || 1, lastDayOfMonth);
    }
    let nextPaymentDate = new Date(nextYear, nextMonth, targetDay);
    nextPaymentDate.setHours(0, 0, 0, 0);

    if (nextPaymentDate > today) {
      break;
    }

    simulationDate = nextPaymentDate;

    // Process expired transfers
    const expired = activeTransfers.filter(t => simulationDate >= t.endDate && t.currentBalance > 0);
    expired.forEach(t => {
      aprBalance += t.currentBalance;
      t.currentBalance = 0;
      if (t.postOfferPayment && t.postOfferPayment > currentMonthlyPayment) {
        currentMonthlyPayment = t.postOfferPayment;
      }
    });
    activeTransfers = activeTransfers.filter(t => simulationDate < t.endDate || t.currentBalance > 0);

    // Interest
    const monthlyRate = (card.apr / 100) / 12;
    const interest = aprBalance * monthlyRate;
    aprBalance += interest;

    // Payment Allocation
    let paymentRemaining = currentMonthlyPayment;
    
    while (paymentRemaining > 0 && (aprBalance > 0 || activeTransfers.some(t => t.currentBalance > 0))) {
      let targetPot = null;
      if (aprBalance > 0) {
        targetPot = { type: 'apr', balance: aprBalance, id: 'apr' };
      } else {
        const transfers = activeTransfers.filter(t => t.currentBalance > 0).sort((a, b) => b.currentBalance - a.currentBalance);
        if (transfers.length > 0) {
          targetPot = { type: 'transfer', balance: transfers[0].currentBalance, id: transfers[0].id };
        }
      }

      if (!targetPot) break;

      const amountToPay = Math.min(targetPot.balance, paymentRemaining);
      
      if (targetPot.type === 'apr') {
        aprBalance -= amountToPay;
      } else {
        const transfer = activeTransfers.find(t => t.id === targetPot.id);
        if (transfer) transfer.currentBalance -= amountToPay;
      }
      
      paymentRemaining -= amountToPay;
    }

    // Post BT logic if all BTs are paid off
    if (activeTransfers.every(t => t.currentBalance <= 0) && card.balanceTransfers.length > 0) {
      const maxPostOffer = Math.max(...card.balanceTransfers.map(t => Number(t.postOfferPayment) || 0));
      if (maxPostOffer > currentMonthlyPayment) {
        currentMonthlyPayment = maxPostOffer;
      }
    }
  }

  const totalRemaining = aprBalance + activeTransfers.reduce((sum, t) => sum + t.currentBalance, 0);

  return {
    ...card,
    calculatedTotalDebt: Math.max(0, totalRemaining),
    calculatedAprBalance: Math.max(0, aprBalance),
    calculatedTransfers: activeTransfers,
    calculatedMonthlyPayment: currentMonthlyPayment,
  };
}

export function simulatePayoff(currentState) {
  const steps = [];
  let currentMonth = 0;
  let totalInterest = 0;
  
  let aprBalance = currentState.calculatedAprBalance;
  let activeTransfers = currentState.calculatedTransfers.map(t => ({ ...t, endDate: new Date(t.endDate) }));
  let currentMonthlyPayment = currentState.calculatedMonthlyPayment;

  let simulationDate = new Date();
  simulationDate.setHours(0, 0, 0, 0);
  
  const card = currentState; 

  while ((aprBalance > 0 || activeTransfers.some(t => t.currentBalance > 0)) && currentMonth < MAX_SIMULATION_MONTHS) {
    let nextYear = simulationDate.getFullYear();
    let nextMonth = simulationDate.getMonth();
    
    let lastDayOfMonth = new Date(nextYear, nextMonth + 1, 0).getDate();
    let targetDay = Math.min(card.paymentDate || 1, lastDayOfMonth);

    if (simulationDate.getDate() >= targetDay) {
      nextMonth++;
      if (nextMonth > 11) {
        nextMonth = 0;
        nextYear++;
      }
      lastDayOfMonth = new Date(nextYear, nextMonth + 1, 0).getDate();
      targetDay = Math.min(card.paymentDate || 1, lastDayOfMonth);
    }
    let nextPaymentDate = new Date(nextYear, nextMonth, targetDay);
    nextPaymentDate.setHours(0, 0, 0, 0);
    simulationDate = nextPaymentDate;

    // Process expired transfers
    const expired = activeTransfers.filter(t => simulationDate >= t.endDate && t.currentBalance > 0);
    expired.forEach(t => {
      aprBalance += t.currentBalance;
      t.currentBalance = 0;
      if (t.postOfferPayment && t.postOfferPayment > currentMonthlyPayment) {
        currentMonthlyPayment = t.postOfferPayment;
      }
    });
    activeTransfers = activeTransfers.filter(t => simulationDate < t.endDate || t.currentBalance > 0);

    // Interest
    const monthlyRate = (card.apr / 100) / 12;
    const interest = aprBalance * monthlyRate;
    aprBalance += interest;
    totalInterest += interest;

    // Safety check
    if (aprBalance > 0 && currentMonthlyPayment <= interest && currentMonth > 100) {
       return { steps, totalInterest, payoffDate: null, monthsToPayoff: currentMonth, isInfinite: true };
    }

    // Payment Allocation
    let paymentRemaining = currentMonthlyPayment;
    let paymentApplied = 0;
    
    while (paymentRemaining > 0 && (aprBalance > 0 || activeTransfers.some(t => t.currentBalance > 0))) {
      let targetPot = null;
      if (aprBalance > 0) {
        targetPot = { type: 'apr', balance: aprBalance, id: 'apr' };
      } else {
        const transfers = activeTransfers.filter(t => t.currentBalance > 0).sort((a, b) => b.currentBalance - a.currentBalance);
        if (transfers.length > 0) {
          targetPot = { type: 'transfer', balance: transfers[0].currentBalance, id: transfers[0].id };
        }
      }

      if (!targetPot) break;

      const amountToPay = Math.min(targetPot.balance, paymentRemaining);
      
      if (targetPot.type === 'apr') {
        aprBalance -= amountToPay;
      } else {
        const transfer = activeTransfers.find(t => t.id === targetPot.id);
        if (transfer) transfer.currentBalance -= amountToPay;
      }
      
      paymentRemaining -= amountToPay;
      paymentApplied += amountToPay;
    }

    // Post BT logic
    if (activeTransfers.every(t => t.currentBalance <= 0) && card.balanceTransfers.length > 0) {
      const maxPostOffer = Math.max(...card.balanceTransfers.map(t => Number(t.postOfferPayment) || 0));
      if (maxPostOffer > currentMonthlyPayment) {
        currentMonthlyPayment = maxPostOffer;
      }
    }

    currentMonth++;

    const totalRemaining = aprBalance + activeTransfers.reduce((sum, t) => sum + t.currentBalance, 0);

    steps.push({
      month: currentMonth,
      date: simulationDate,
      totalRemaining: Math.max(0, totalRemaining),
      interestCharged: interest,
      paymentApplied: paymentApplied,
      aprBalance,
      transferBalances: activeTransfers.map(t => t.currentBalance)
    });

    if (totalRemaining <= 0) break;
  }

  return {
    steps,
    totalInterest,
    payoffDate: currentMonth < MAX_SIMULATION_MONTHS ? simulationDate : null,
    monthsToPayoff: currentMonth,
    isInfinite: currentMonth >= MAX_SIMULATION_MONTHS
  };
}
