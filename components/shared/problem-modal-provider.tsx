"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { ProblemModal } from "./problem-modal";

interface ProblemModalState {
  openProblem: (problemId: string) => void;
  closeProblem: () => void;
}

const ProblemModalContext = createContext<ProblemModalState | null>(null);

export function ProblemModalProvider({ children }: { children: React.ReactNode }) {
  const [activeProblemId, setActiveProblemId] = useState<string | null>(null);

  const openProblem = useCallback((problemId: string) => setActiveProblemId(problemId), []);
  const closeProblem = useCallback(() => setActiveProblemId(null), []);

  return (
    <ProblemModalContext.Provider value={{ openProblem, closeProblem }}>
      {children}
      {activeProblemId && (
        <ProblemModal key={activeProblemId} problemId={activeProblemId} onClose={closeProblem} />
      )}
    </ProblemModalContext.Provider>
  );
}

export function useProblemModal() {
  const ctx = useContext(ProblemModalContext);
  if (!ctx) {
    throw new Error("useProblemModal must be used within a ProblemModalProvider");
  }
  return ctx;
}
