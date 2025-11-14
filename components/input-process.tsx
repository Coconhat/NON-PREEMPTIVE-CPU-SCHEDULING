"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";

export function InputForm({ onSubmit }: { onSubmit: (num: number) => void }) {
  const [numberOfProcesses, setNumberOfProcesses] = useState<number | "">("");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    // parse the current input
    const num =
      typeof numberOfProcesses === "string"
        ? Number(numberOfProcesses)
        : numberOfProcesses;

    if (isNaN(num) || num < 3 || num > 10) {
      toast.error("Please enter a number between 3 and 10");
      return;
    }

    onSubmit(num);
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex justify-center mt-10">
        <div className="flex w-full max-w-sm items-center gap-2">
          <Input
            type="number"
            value={numberOfProcesses}
            onChange={(e) => {
              const value = e.target.value;
              setNumberOfProcesses(value === "" ? "" : Number(value));
            }}
          />
          <Button type="submit" variant="outline">
            Enter
          </Button>
        </div>
      </div>
    </form>
  );
}
