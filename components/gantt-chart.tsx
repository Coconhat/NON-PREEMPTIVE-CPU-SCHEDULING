import { Card, CardContent } from "@/components/ui/card";

interface GanttChartProps {
  processes: {
    name: string;
    arrivalTime: number;
    burstTime: number;
    waitingTime?: number;
    turnAroundTime?: number;
  }[];
}

export function GanttChart({ processes }: GanttChartProps) {
  if (!processes.length) return null;

  // Build timeline based on processes
  let currentTime = 0;
  const timeline: { label: string; start: number; end: number }[] = [];

  processes.forEach((p) => {
    if (currentTime < p.arrivalTime) {
      // CPU idle block
      timeline.push({
        label: "Idle",
        start: currentTime,
        end: p.arrivalTime,
      });
      currentTime = p.arrivalTime;
    }
    timeline.push({
      label: p.name || `P?`,
      start: currentTime,
      end: currentTime + p.burstTime,
    });
    currentTime += p.burstTime;
  });

  const totalTime = timeline[timeline.length - 1].end;

  // Tailwind color palette (HSL-based utility classes)
  const colors = [
    "bg-green-400",
    "bg-emerald-400",
    "bg-teal-400",
    "bg-cyan-400",
    "bg-lime-400",
    "bg-sky-400",
    "bg-blue-400",
  ];

  return (
    <Card className="mt-4 max-w-2xl mx-auto shadow-md rounded-xl">
      <CardContent className="p-4">
        <h3 className="text-base font-semibold mb-2">Gantt Chart</h3>
        <div className="flex items-stretch border rounded-md overflow-hidden h-16">
          {timeline.map((block, i) => {
            const widthPercent = ((block.end - block.start) / totalTime) * 100;
            const colorClass =
              block.label === "Idle"
                ? "bg-slate-200"
                : colors[i % colors.length];

            return (
              <div
                key={i}
                className={`flex flex-col items-center justify-center text-white text-sm font-medium ${colorClass}`}
                style={{ width: `${widthPercent}%` }}
              >
                <span>{block.label}</span>
                <div className="text-xs text-slate-100">
                  {block.start} - {block.end}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
