## Operating Systems Playground

A single-page simulator that demonstrates:

- **Non-preemptive scheduling (FCFS & SJF):** Enter process names, arrival times, and burst times to visualize the resulting Gantt chart alongside total/average waiting and turnaround times.
- **Banker’s Algorithm for deadlock avoidance:** Provide the total resource pool, configure 3–10 processes (ID, maximum claim, and current allocation), and enumerate every possible completion order. Each permutation is labelled _SAFE_ or _UNSAFE_ based on the classic Banker’s safety check.

## Quick Start

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` to interact with both simulators. The Banker’s section lives near the bottom of the page—configure the system snapshot, hit **Evaluate Permutations**, and scroll through the generated sequences. Keep in mind that the number of permutations grows factorially (10! = 3,628,800), so very large process counts may take extra time to enumerate.

## Available Scripts

- `npm run dev` – start the Next.js dev server with Turbopack
- `npm run build` – create an optimized production build
- `npm run start` – serve the production build
- `npm run lint` – run ESLint across the project

## Tech Stack

- Next.js App Router
- React 19 + TypeScript
- Tailwind CSS v4 & shadcn-inspired UI primitives
- Sonner for inline feedback/toasts
