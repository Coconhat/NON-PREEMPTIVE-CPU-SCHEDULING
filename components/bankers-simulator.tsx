"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BankersProcess,
  SequenceResult,
  evaluateBankersPermutations,
} from "@/app/utils/bankers";

interface ProcessRow {
  processId: string;
  maxNeed: number | "";
  currentHold: number | "";
}

interface SummaryStats {
  available: number;
  safe: number;
  unsafe: number;
}

export function BankersSimulator() {
  const [totalResourcesInput, setTotalResourcesInput] = useState<string>("");
  const [processCountInput, setProcessCountInput] = useState<string>("");
  const [configuredTotalResources, setConfiguredTotalResources] = useState<
    number | null
  >(null);
  const [rows, setRows] = useState<ProcessRow[]>([]);
  const [results, setResults] = useState<SequenceResult[]>([]);
  const [summary, setSummary] = useState<SummaryStats | null>(null);

  function handleConfigure(event: React.FormEvent) {
    event.preventDefault();

    const total = Number(totalResourcesInput);
    const count = Number(processCountInput);

    if (!Number.isFinite(total) || total <= 0) {
      toast.error("Total resources must be a positive number");
      return;
    }

    if (!Number.isInteger(count) || count < 3 || count > 10) {
      toast.error("Number of processes must be between 3 and 10");
      return;
    }

    setConfiguredTotalResources(total);
    setRows(
      Array.from({ length: count }, (_, index) => ({
        processId: `P${index + 1}`,
        maxNeed: "",
        currentHold: "",
      }))
    );
    setResults([]);
    setSummary(null);
  }

  function handleReset() {
    setTotalResourcesInput("");
    setProcessCountInput("");
    setConfiguredTotalResources(null);
    setRows([]);
    setResults([]);
    setSummary(null);
  }

  function handleRowChange(
    index: number,
    field: keyof Omit<ProcessRow, "processId">,
    value: string
  ) {
    setRows((prev) => {
      const next = [...prev];
      const parsedValue = value === "" ? "" : Number(value);
      next[index] = { ...next[index], [field]: parsedValue };
      return next;
    });
  }

  function handleIdChange(index: number, value: string) {
    setRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], processId: value };
      return next;
    });
  }

  function handleCompute() {
    if (configuredTotalResources === null) {
      toast.error("Configure the system before running the algorithm");
      return;
    }

    if (!rows.length) {
      toast.error("Add process definitions first");
      return;
    }

    const normalized: BankersProcess[] = [];

    for (const row of rows) {
      const processId = row.processId.trim();
      if (!processId) {
        toast.error("Each process must have an ID");
        return;
      }

      if (row.maxNeed === "" || row.currentHold === "") {
        toast.error(
          "Fill in maximum need and current holding for every process"
        );
        return;
      }

      if (row.maxNeed <= 0) {
        toast.error("Maximum need must be greater than zero");
        return;
      }

      if (row.currentHold < 0) {
        toast.error("Currently holding cannot be negative");
        return;
      }

      if (row.currentHold > row.maxNeed) {
        toast.error("A process cannot hold more than its maximum need");
        return;
      }

      normalized.push({
        processId,
        maxNeed: Number(row.maxNeed),
        allocation: Number(row.currentHold),
        need: Number(row.maxNeed) - Number(row.currentHold),
      });
    }

    const ids = normalized.map((row) => row.processId.toLowerCase());
    if (new Set(ids).size !== ids.length) {
      toast.error("Process IDs must be unique");
      return;
    }

    const totalAllocation = normalized.reduce(
      (sum, process) => sum + process.allocation,
      0
    );

    const available = configuredTotalResources - totalAllocation;
    if (available < 0) {
      toast.error("Allocated resources exceed the total resources available");
      return;
    }

    const sequenceResults = evaluateBankersPermutations(normalized, available);
    setResults(sequenceResults);
    setSummary({
      available,
      safe: sequenceResults.filter((entry) => entry.safe).length,
      unsafe: sequenceResults.filter((entry) => !entry.safe).length,
    });
  }

  const needPreview = useMemo(
    () =>
      rows.map((row) =>
        row.maxNeed === "" || row.currentHold === ""
          ? "?"
          : Number(row.maxNeed) - Number(row.currentHold)
      ),
    [rows]
  );

  return (
    <Card className="mt-12">
      <CardHeader>
        <div>
          <CardTitle>Banker&apos;s Algorithm Simulator</CardTitle>
          <CardDescription>
            Enter the system snapshot and review every possible sequence to see
            whether it leads to a safe or unsafe state.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <form
          onSubmit={handleConfigure}
          className="grid gap-4 md:grid-cols-3 md:items-end"
        >
          <label className="flex flex-col gap-2 text-sm font-medium">
            Total Resources
            <Input
              type="number"
              min={1}
              value={totalResourcesInput}
              onChange={(event) => setTotalResourcesInput(event.target.value)}
              required
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Number of Processes (3-10)
            <Input
              type="number"
              min={3}
              max={10}
              value={processCountInput}
              onChange={(event) => setProcessCountInput(event.target.value)}
              required
            />
          </label>
          <Button type="submit">Configure</Button>
        </form>

        {rows.length > 0 && (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-3 text-sm font-semibold uppercase tracking-wide text-slate-600">
              <span>Process ID</span>
              <span>Maximum Need</span>
              <span>Currently Holding</span>
              <span>Need</span>
            </div>
            {rows.map((row, index) => (
              <div
                key={row.processId + index}
                className="grid grid-cols-4 gap-3 rounded-lg border p-4"
              >
                <Input
                  value={row.processId}
                  onChange={(event) =>
                    handleIdChange(index, event.target.value)
                  }
                  placeholder="P1"
                />
                <Input
                  type="number"
                  min={1}
                  value={row.maxNeed}
                  onChange={(event) =>
                    handleRowChange(index, "maxNeed", event.target.value)
                  }
                />
                <Input
                  type="number"
                  min={0}
                  value={row.currentHold}
                  onChange={(event) =>
                    handleRowChange(index, "currentHold", event.target.value)
                  }
                />
                <div className="flex items-center justify-center rounded border bg-slate-50 text-sm font-semibold">
                  {needPreview[index]}
                </div>
              </div>
            ))}

            <div className="flex flex-wrap gap-3">
              <Button onClick={handleCompute}>Evaluate Permutations</Button>
              <Button onClick={handleReset} variant="secondary">
                Reset
              </Button>
            </div>
          </div>
        )}

        {summary && (
          <div className="grid gap-4 rounded-xl border p-4 md:grid-cols-3">
            <div>
              <p className="text-xs uppercase text-slate-500">
                Initial Available
              </p>
              <p className="text-2xl font-semibold">{summary.available}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-slate-500">Safe Sequences</p>
              <p className="text-2xl font-semibold text-emerald-600">
                {summary.safe}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase text-slate-500">
                Unsafe Sequences
              </p>
              <p className="text-2xl font-semibold text-rose-600">
                {summary.unsafe}
              </p>
            </div>
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold">Possible combinations</h4>
              <p className="text-sm text-muted-foreground">
                Showing {results.length} permutations
              </p>
            </div>
            <div className="max-h-96 overflow-y-auto rounded-xl border">
              {results.map((result, index) => (
                <div
                  key={`${result.order.join("-")}-${index}`}
                  className="flex items-center justify-between border-b px-4 py-2 text-sm last:border-b-0"
                >
                  <span className="font-mono">{index + 1}.</span>
                  <span className="flex-1 px-4 font-mono">
                    {result.order.join(" ")}
                  </span>
                  <span
                    className={
                      result.safe
                        ? "font-semibold text-emerald-600"
                        : "font-semibold text-rose-600"
                    }
                  >
                    {result.safe ? "SAFE" : "UNSAFE"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
