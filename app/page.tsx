"use client";
import { InputForm } from "@/components/input-process";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { GanttChart } from "@/components/gantt-chart";
import { BankersSimulator } from "@/components/bankers-simulator";

interface Processes {
  id: number;
  name: string;
  burstTime: number;
  arrivalTime: number;
  waitingTime?: number;
  turnAroundTime?: number;
}

type Algorithm = "FCFS" | "SJF" | "BANKER";

export default function Home() {
  const [numberOfProcesses, setNumberOfProcesses] = useState<number | null>(
    null
  );
  const [processes, setProcesses] = useState<Processes[]>([]);
  const [waitingTime, setWaitingTime] = useState<number | null>(null);
  const [averageWaitingTime, setAverageWaitingTime] = useState<number | null>(
    null
  );
  const [turnAroundTime, setTurnAroundTime] = useState<number | null>(null);
  const [averageTurnAroundTime, setAverageTurnAroundTime] = useState<
    number | null
  >(null);
  const [algorithm, setAlgorithm] = useState<Algorithm>("FCFS");
  const [timeline, setTimeline] = useState<
    { label: string; start: number; end: number }[]
  >([]);
  const isBankersAlgorithm = algorithm === "BANKER";

  // when user sets number of processes, initialize the processes array
  function handleSetNumber(num: number) {
    setNumberOfProcesses(num);
    setProcesses(
      Array.from({ length: num }, (_, i) => ({
        id: i + 1,
        name: "",
        burstTime: 0,
        arrivalTime: 0,
      }))
    );
    setAverageWaitingTime(null);
  }

  // update a single field of a process
  function handleProcessChange(
    index: number,
    field: keyof Processes,
    value: string | number
  ) {
    const updated = [...processes];
    updated[index] = {
      ...updated[index],
      [field]: field === "name" ? value : Number(value),
    };
    setProcesses(updated);
  }

  function handleReset() {
    setNumberOfProcesses(null);
    setProcesses([]);
    setWaitingTime(null);
    setAverageWaitingTime(null);
    setTurnAroundTime(null);
    setAverageTurnAroundTime(null);
    setTimeline([]);
  }

  function handleSubmitAll() {
    // Validation
    for (const p of processes) {
      if (!p.name || p.arrivalTime < 0 || p.burstTime <= 0) {
        toast("⚠️ Please fill in all fields correctly for every process!");
        return;
      }
    }

    const names = processes.map((p) => p.name.trim().toLowerCase());
    if (new Set(names).size !== names.length) {
      toast("⚠️ Process names must be unique!");
      return;
    }

    if (algorithm === "FCFS") {
      calculateFCFS();
    } else if (algorithm === "SJF") {
      calculateSJF();
    }
  }

  function calculateFCFS() {
    const timelineArr: { label: string; start: number; end: number }[] = [];

    let currentTime = 0;
    let totalWaiting = 0;
    let totalTurnAround = 0;

    const sorted = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);

    const updated = sorted.map((process) => {
      if (currentTime < process.arrivalTime) currentTime = process.arrivalTime;

      const waitingTime = currentTime - process.arrivalTime;
      const turnAroundTime = waitingTime + process.burstTime;

      timelineArr.push({
        label: process.name,
        start: currentTime,
        end: currentTime + process.burstTime,
      });

      totalWaiting += waitingTime;
      totalTurnAround += turnAroundTime;
      currentTime += process.burstTime;

      return { ...process, waitingTime, turnAroundTime };
    });

    setProcesses(updated);
    setWaitingTime(totalWaiting);
    setAverageWaitingTime(totalWaiting / updated.length);
    setTurnAroundTime(totalTurnAround);
    setAverageTurnAroundTime(totalTurnAround / updated.length);
    setTimeline(timelineArr);
  }

  function calculateSJF() {
    let currentTime = 0;
    const completed: Processes[] = [];
    let readyQueue: Processes[] = [...processes].sort(
      (a, b) => a.arrivalTime - b.arrivalTime
    );
    let totalWaiting = 0;
    let totalTurnAround = 0;
    const timelineArr: { label: string; start: number; end: number }[] = [];

    while (readyQueue.length > 0) {
      const available = readyQueue.filter((p) => p.arrivalTime <= currentTime);

      if (available.length === 0) {
        currentTime = readyQueue[0].arrivalTime;
        continue;
      }

      const nextProcess = available.reduce((prev, curr) =>
        curr.burstTime < prev.burstTime ? curr : prev
      );

      readyQueue = readyQueue.filter((p) => p.id !== nextProcess.id);

      const waitingTime = currentTime - nextProcess.arrivalTime;
      const turnAroundTime = waitingTime + nextProcess.burstTime;

      timelineArr.push({
        label: nextProcess.name,
        start: currentTime,
        end: currentTime + nextProcess.burstTime,
      });

      totalWaiting += waitingTime;
      totalTurnAround += turnAroundTime;
      currentTime += nextProcess.burstTime;

      completed.push({ ...nextProcess, waitingTime, turnAroundTime });
    }

    setProcesses(completed);
    setWaitingTime(totalWaiting);
    setAverageWaitingTime(totalWaiting / completed.length);
    setTurnAroundTime(totalTurnAround);
    setAverageTurnAroundTime(totalTurnAround / completed.length);
    setTimeline(timelineArr);
  }

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 py-8">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight">
          Scheduling Algorithm Simulator
        </h1>
        <p className="mt-2 text-lg">
          A Non-Preemptive Scheduling Algorithm Simulator
        </p>
      </div>

      <div className="mt-6 flex justify-center gap-4">
        <label className="flex items-center gap-2">
          <span className="font-medium">Algorithm:</span>
          <select
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value as Algorithm)}
            className="border rounded p-2"
          >
            <option value="FCFS">FCFS</option>
            <option value="SJF">SJF</option>
            <option value="BANKER">Banker&apos;s Algorithm</option>
          </select>
        </label>
      </div>
      {isBankersAlgorithm ? (
        <BankersSimulator />
      ) : (
        <>
          <GanttChart timeline={timeline} />

          <div className="p-8">
            <InputForm onSubmit={handleSetNumber} />

            {numberOfProcesses && (
              <div>
                <div className="grid grid-cols-4 gap-4 items-center mt-8 font-semibold text-lg">
                  <span>Process Name</span>
                  <span>Arrival Time</span>
                  <span>Burst Time</span>
                  <span>ID</span>
                </div>
                <div className="mt-4 space-y-4">
                  {processes.map((process, index) => (
                    <div
                      key={process.id}
                      className="grid grid-cols-4 gap-4 items-center border p-4 rounded-lg shadow-sm"
                    >
                      <Input
                        placeholder="Name"
                        required
                        value={process.name}
                        onChange={(e) =>
                          handleProcessChange(index, "name", e.target.value)
                        }
                      />
                      <Input
                        type="number"
                        required
                        placeholder="Arrival Time"
                        value={process.arrivalTime}
                        onChange={(e) =>
                          handleProcessChange(
                            index,
                            "arrivalTime",
                            e.target.value
                          )
                        }
                      />
                      <Input
                        type="number"
                        required
                        placeholder="Burst Time"
                        value={process.burstTime}
                        onChange={(e) =>
                          handleProcessChange(
                            index,
                            "burstTime",
                            e.target.value
                          )
                        }
                      />
                      <span className="text-slate-500">P{process.id}</span>
                    </div>
                  ))}

                  <div className="flex gap-5">
                    <Button onClick={handleSubmitAll} className="mt-4">
                      🚀 Submit Processes
                    </Button>
                    <Button
                      onClick={handleReset}
                      variant="destructive"
                      className="mt-4"
                    >
                      Reset
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {waitingTime !== null && turnAroundTime !== null && (
            <div className="mt-12">
              <h2 className="text-3xl font-semibold border-b pb-2">Results</h2>

              <div className="overflow-x-auto mt-6">
                <table className="min-w-full border border-slate-200 text-center">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="px-4 py-2 border">Process</th>
                      <th className="px-4 py-2 border">Arrival</th>
                      <th className="px-4 py-2 border">Burst</th>
                      <th className="px-4 py-2 border">Waiting</th>
                      <th className="px-4 py-2 border">Turnaround</th>
                    </tr>
                  </thead>
                  <tbody>
                    {processes.map((p) => (
                      <tr key={p.id}>
                        <td className="px-4 py-2 border font-medium">
                          {p.name}
                        </td>
                        <td className="px-4 py-2 border">{p.arrivalTime}</td>
                        <td className="px-4 py-2 border">{p.burstTime}</td>
                        <td className="px-4 py-2 border">{p.waitingTime}</td>
                        <td className="px-4 py-2 border">{p.turnAroundTime}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg shadow bg-slate-50 text-center">
                  <h3 className="text-lg font-semibold">Total Waiting Time</h3>
                  <p className="text-xl font-bold">{waitingTime}</p>
                  <p className="text-sm text-slate-500">
                    Average: {averageWaitingTime?.toFixed(2)}
                  </p>
                </div>
                <div className="p-4 border rounded-lg shadow bg-slate-50 text-center">
                  <h3 className="text-lg font-semibold">
                    Total Turnaround Time
                  </h3>
                  <p className="text-xl font-bold">{turnAroundTime}</p>
                  <p className="text-sm text-slate-500">
                    Average: {averageTurnAroundTime?.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <footer className="mt-6">
        <blockquote className="text-muted-foreground text-sm">
          Made by{" "}
          <span className="bg-muted rounded px-1 py-0.5 font-mono text-sm font-semibold">
            Nhat Vu Le
          </span>
        </blockquote>
      </footer>
    </div>
  );
}
