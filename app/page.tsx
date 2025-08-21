"use client";
import { InputForm } from "@/components/input-process";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { unique } from "next/dist/build/utils";
import { GanttChart } from "@/components/gantt-chart";

interface Processes {
  id: number;
  name: string;
  burstTime: number;
  arrivalTime: number;
  waitingTime?: number;
  turnAroundTime?: number;
}

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
  }

  function handleSubmitAll() {
    // Validation: all fields required

    for (const p of processes) {
      if (!p.name || p.arrivalTime < 0 || p.burstTime <= 0) {
        toast("⚠️ Please fill in all fields correctly for every process!");
        return;
      }

      const names = processes.map((p) => p.name.trim().toLowerCase());
      const uniqueNames = new Set(names);

      if (uniqueNames.size !== names.length) {
        toast("⚠️ Process names must be unique!");
        return;
      }
    }
    calculateWaitingTimesAndTAT();
  }

  function calculateWaitingTimesAndTAT() {
    let currentTime = 0;
    let totalWaiting = 0;
    let totalTurnAround = 0;

    // Sort processes by arrival time (FCFS order)
    const sorted = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);

    const updated = sorted.map((process) => {
      if (currentTime < process.arrivalTime) {
        currentTime = process.arrivalTime; // CPU idle until process arrives
      }

      const waitingTime = currentTime - process.arrivalTime;
      const turnAroundTime = waitingTime + process.burstTime;

      totalWaiting += waitingTime;
      totalTurnAround += turnAroundTime;

      currentTime += process.burstTime; // move time forward

      return { ...process, waitingTime, turnAroundTime };
    });

    setProcesses(updated);
    setAverageWaitingTime(totalWaiting / updated.length);
    setWaitingTime(totalWaiting);
    setAverageTurnAroundTime(totalTurnAround / updated.length);
    setTurnAroundTime(totalTurnAround);
  }

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 py-8">
      <div className="text-center">
        <h1 className="scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance">
          First Come First Serve Algorithm
        </h1>
        <p className="leading-7 [&:not(:first-child)]:mt-6">
          A Non-Preemptive Scheduling Algorithm Simulator
        </p>
      </div>

      <GanttChart processes={processes} />

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
                      handleProcessChange(index, "arrivalTime", e.target.value)
                    }
                  />
                  <Input
                    type="number"
                    required
                    placeholder="Burst Time"
                    value={process.burstTime}
                    onChange={(e) =>
                      handleProcessChange(index, "burstTime", e.target.value)
                    }
                  />
                  <span className="text-slate-500">P{process.id}</span>
                </div>
              ))}

              <div className="flex gap-5">
                <Button onClick={handleSubmitAll} className="mt-4 ">
                  🚀 Submit Processes
                </Button>
                <Button
                  onClick={handleReset}
                  variant="destructive"
                  className="mt-4 "
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
          <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
            Results
          </h2>

          {/* Table for results */}
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
                    <td className="px-4 py-2 border font-medium">{p.name}</td>
                    <td className="px-4 py-2 border">{p.arrivalTime}</td>
                    <td className="px-4 py-2 border">{p.burstTime}</td>
                    <td className="px-4 py-2 border">{p.waitingTime}</td>
                    <td className="px-4 py-2 border">{p.turnAroundTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals and averages */}
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg shadow bg-slate-50 text-center">
              <h3 className="text-lg font-semibold">Total Waiting Time</h3>
              <p className="text-xl font-bold">{waitingTime}</p>
              <p className="text-sm text-slate-500">
                Average: {averageWaitingTime?.toFixed(2)}
              </p>
            </div>
            <div className="p-4 border rounded-lg shadow bg-slate-50 text-center">
              <h3 className="text-lg font-semibold">Total Turnaround Time</h3>
              <p className="text-xl font-bold">{turnAroundTime}</p>
              <p className="text-sm text-slate-500">
                Average: {averageTurnAroundTime?.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}

      <footer className="mt-6">
        <blockquote className="text-muted-foreground text-sm">
          Made by{" "}
          <span className="bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
            Nhat Vu Le
          </span>
        </blockquote>
      </footer>
    </div>
  );
}
