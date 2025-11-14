export interface BankersProcess {
  processId: string;
  maxNeed: number;
  allocation: number;
  need: number;
}

export interface SequenceResult {
  order: string[];
  safe: boolean;
}

function canFinishOrder(
  processes: BankersProcess[],
  order: number[],
  initialAvailable: number
): boolean {
  let available = initialAvailable;

  for (const index of order) {
    const process = processes[index];
    if (process.need > available) {
      return false;
    }
    available += process.allocation;
  }

  return true;
}

/**
 * Generate all permutations of the supplied processes and determine if each
 * ordering keeps the system in a safe state.
 */
export function evaluateBankersPermutations(
  processes: BankersProcess[],
  initialAvailable: number
): SequenceResult[] {
  if (!processes.length) {
    return [];
  }

  const order = processes.map((_, index) => index);
  const control = new Array(processes.length).fill(0);
  const results: SequenceResult[] = [];

  const pushCurrentOrder = () => {
    results.push({
      order: order.map((idx) => processes[idx].processId),
      safe: canFinishOrder(processes, order, initialAvailable),
    });
  };

  pushCurrentOrder();

  let i = 0;
  while (i < processes.length) {
    if (control[i] < i) {
      if (i % 2 === 0) {
        [order[0], order[i]] = [order[i], order[0]];
      } else {
        [order[control[i]], order[i]] = [order[i], order[control[i]]];
      }

      pushCurrentOrder();
      control[i] += 1;
      i = 0;
    } else {
      control[i] = 0;
      i += 1;
    }
  }

  return results;
}
