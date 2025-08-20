// Place this code in app/page.tsx in your Next.js project
"use client";

import { useState } from "react";

// Define the structure for a Process
interface Process {
  id: string;
  name: string;
  arrivalTime: number;
  burstTime: number;
}

// Define the structure for the calculated results of a Process
interface ProcessResult extends Process {
  completionTime: number;
  turnaroundTime: number;
  waitingTime: number;
}

export default function FCFSSchedulerPage() {
  const [numProcesses, setNumProcesses] = useState<number | string>("");
  const [processes, setProcesses] = useState<Process[]>([]);
  const [results, setResults] = useState<ProcessResult[]>([]);
  const [avgWaitingTime, setAvgWaitingTime] = useState<number>(0);
  const [avgTurnaroundTime, setAvgTurnaroundTime] = useState<number>(0);
  const [error, setError] = useState<string>("");
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // Handle setting the number of processes
  const handleSetNumProcesses = () => {
    const n = Number(numProcesses);
    if (isNaN(n) || n < 3 || n > 10) {
      setError("Please enter a valid number of processes (3-10).");
      return;
    }
    setError("");
    const newProcesses: Process[] = Array.from({ length: n }, (_, i) => ({
      id: `p${i}`,
      name: `P${i + 1}`,
      arrivalTime: 0,
      burstTime: 0,
    }));
    setProcesses(newProcesses);
    setIsSubmitted(true);
    setResults([]); // Clear previous results
  };

  // Handle input changes for individual processes
  const handleProcessChange = (
    index: number,
    field: keyof Process,
    value: string
  ) => {
    const updatedProcesses = [...processes];
    if (field === "arrivalTime" || field === "burstTime") {
      updatedProcesses[index][field] = Number(value);
    } else if (field === "name") {
      updatedProcesses[index][field] = value;
    }
    setProcesses(updatedProcesses);
  };

  // FCFS Scheduling Algorithm Logic
  const calculateFCFS = () => {
    // Validation
    for (const p of processes) {
      if (isNaN(p.arrivalTime) || isNaN(p.burstTime) || p.burstTime <= 0) {
        setError(
          "Please enter valid, positive numbers for all Arrival and Burst Times."
        );
        return;
      }
      if (p.name.trim() === "") {
        setError("Process ID cannot be empty.");
        return;
      }
    }
    setError("");

    // Sort processes by arrival time (the core of FCFS)
    const sortedProcesses = [...processes].sort(
      (a, b) => a.arrivalTime - b.arrivalTime
    );

    const calculatedResults: ProcessResult[] = [];
    let currentTime = 0;
    let totalWaitingTime = 0;
    let totalTurnaroundTime = 0;

    sortedProcesses.forEach((process) => {
      // If the CPU is idle until the process arrives, move time forward
      if (currentTime < process.arrivalTime) {
        currentTime = process.arrivalTime;
      }

      const waitingTime = currentTime - process.arrivalTime;
      const completionTime = currentTime + process.burstTime;
      const turnaroundTime = completionTime - process.arrivalTime;

      calculatedResults.push({
        ...process,
        completionTime,
        turnaroundTime,
        waitingTime,
      });

      totalWaitingTime += waitingTime;
      totalTurnaroundTime += turnaroundTime;

      // The next process will start after the current one finishes
      currentTime = completionTime;
    });

    setResults(calculatedResults);
    setAvgWaitingTime(totalWaitingTime / processes.length);
    setAvgTurnaroundTime(totalTurnaroundTime / processes.length);
  };

  // Reset function to start over
  const handleReset = () => {
    setNumProcesses("");
    setProcesses([]);
    setResults([]);
    setAvgWaitingTime(0);
    setAvgTurnaroundTime(0);
    setError("");
    setIsSubmitted(false);
  };

  return (
    <div className="bg-slate-900 text-white min-h-screen p-4 sm:p-8 flex flex-col items-center">
      <div className="w-full max-w-4xl">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-cyan-400">
            FCFS CPU Scheduler
          </h1>
          <p className="text-slate-400 mt-2">
            A Non-Preemptive Scheduling Algorithm Simulator
          </p>
        </header>

        <main className="bg-slate-800 p-6 rounded-lg shadow-xl">
          {!isSubmitted ? (
            <div className="flex flex-col items-center">
              <label htmlFor="numProcesses" className="text-lg mb-2">
                Enter the number of processes (3-10):
              </label>
              <input
                type="number"
                id="numProcesses"
                value={numProcesses}
                onChange={(e) => setNumProcesses(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSetNumProcesses()}
                className="bg-slate-700 p-2 rounded w-48 text-center"
                min="3"
                max="10"
              />
              <button
                onClick={handleSetNumProcesses}
                className="mt-4 bg-cyan-500 hover:bg-cyan-600 font-bold py-2 px-6 rounded transition-colors"
              >
                Set
              </button>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="font-bold text-center p-2 rounded-md bg-slate-700">
                  Process ID
                </div>
                <div className="font-bold text-center p-2 rounded-md bg-slate-700">
                  Arrival Time
                </div>
                <div className="font-bold text-center p-2 rounded-md bg-slate-700">
                  Burst Time
                </div>
              </div>

              {processes.map((p, index) => (
                <div
                  key={p.id}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3 items-center"
                >
                  <input
                    type="text"
                    value={p.name}
                    onChange={(e) =>
                      handleProcessChange(index, "name", e.target.value)
                    }
                    className="bg-slate-700 p-2 rounded text-center"
                  />
                  <input
                    type="number"
                    value={p.arrivalTime}
                    onChange={(e) =>
                      handleProcessChange(index, "arrivalTime", e.target.value)
                    }
                    className="bg-slate-700 p-2 rounded text-center"
                  />
                  <input
                    type="number"
                    value={p.burstTime}
                    onChange={(e) =>
                      handleProcessChange(index, "burstTime", e.target.value)
                    }
                    className="bg-slate-700 p-2 rounded text-center"
                    min="1"
                  />
                </div>
              ))}
              <div className="flex justify-center space-x-4 mt-6">
                <button
                  onClick={calculateFCFS}
                  className="bg-green-500 hover:bg-green-600 font-bold py-2 px-8 rounded transition-colors"
                >
                  Calculate
                </button>
                <button
                  onClick={handleReset}
                  className="bg-red-500 hover:bg-red-600 font-bold py-2 px-8 rounded transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>
          )}

          {error && <p className="text-red-400 mt-4 text-center">{error}</p>}

          {results.length > 0 && (
            <div className="mt-8">
              <h2 className="text-3xl font-bold text-cyan-400 text-center mb-4">
                Results
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-center">
                  <thead className="bg-slate-700">
                    <tr>
                      <th className="p-3">Process ID</th>
                      <th className="p-3">Arrival Time</th>
                      <th className="p-3">Burst Time</th>
                      <th className="p-3">Waiting Time</th>
                      <th className="p-3">Turnaround Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r) => (
                      <tr
                        key={r.id}
                        className="bg-slate-800 border-b border-slate-700"
                      >
                        <td className="p-3">{r.name}</td>
                        <td className="p-3">{r.arrivalTime}</td>
                        <td className="p-3">{r.burstTime}</td>
                        <td className="p-3">{r.waitingTime}</td>
                        <td className="p-3">{r.turnaroundTime}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 flex flex-col md:flex-row justify-center items-center text-center gap-4 md:gap-8">
                <div className="bg-slate-700 p-4 rounded-lg">
                  <h3 className="text-lg font-bold">Average Waiting Time</h3>
                  <p className="text-2xl text-cyan-400">
                    {avgWaitingTime.toFixed(2)}
                  </p>
                </div>
                <div className="bg-slate-700 p-4 rounded-lg">
                  <h3 className="text-lg font-bold">Average Turnaround Time</h3>
                  <p className="text-2xl text-cyan-400">
                    {avgTurnaroundTime.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
