"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import ReactMarkdown from "react-markdown";
import { ProblemDetail } from "@/lib/types";
import { ProblemWorkbench } from "@/components/problem-workbench";

type Props = {
  problem: ProblemDetail;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function ProblemWorkspace({ problem }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [leftPanePercent, setLeftPanePercent] = useState(30);
  const [dragging, setDragging] = useState(false);

  const updateSplit = useCallback((clientX: number): void => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const bounds = container.getBoundingClientRect();
    if (bounds.width <= 0) {
      return;
    }

    const ratio = ((clientX - bounds.left) / bounds.width) * 100;
    setLeftPanePercent(clamp(ratio, 20, 70));
  }, []);

  useEffect(() => {
    if (!dragging) {
      return;
    }

    const onMove = (event: PointerEvent): void => {
      updateSplit(event.clientX);
    };
    const stopDragging = (): void => {
      setDragging(false);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", stopDragging);
    window.addEventListener("pointercancel", stopDragging);

    const previousCursor = document.body.style.cursor;
    const previousSelection = document.body.style.userSelect;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", stopDragging);
      window.removeEventListener("pointercancel", stopDragging);
      document.body.style.cursor = previousCursor;
      document.body.style.userSelect = previousSelection;
    };
  }, [dragging, updateSplit]);

  const handleDragStart = (event: ReactPointerEvent<HTMLButtonElement>): void => {
    event.preventDefault();
    updateSplit(event.clientX);
    setDragging(true);
  };

  return (
    <section className="problem-workspace-container">
      <div ref={containerRef} className="problem-workspace-resizable">
        <article className="problem-panel problem-panel-left" style={{ width: `${leftPanePercent}%` }}>
          <div className="problem-pane-section markdown-body">
            <h2>Statement</h2>
            <ReactMarkdown>{problem.statementMarkdown}</ReactMarkdown>
          </div>

          <div className="problem-pane-section markdown-body">
            <h2>Constraints</h2>
            <ReactMarkdown>{problem.constraintsMarkdown}</ReactMarkdown>
          </div>

          <div className="problem-pane-section">
            <h2>Sample Cases</h2>
            <div className="sample-grid">
              {problem.samples.map((sample) => (
                <article key={sample.name} className="sample-card">
                  <h3>{sample.name}</h3>
                  <p>
                    <strong>Input:</strong> {sample.input}
                  </p>
                  <p>
                    <strong>Expected:</strong> {sample.expected}
                  </p>
                  <p>{sample.explanation}</p>
                </article>
              ))}
            </div>
          </div>

          {problem.assets.length > 0 ? (
            <div className="problem-pane-section">
              <h2>Reference Assets</h2>
              <div className="asset-grid">
                {problem.assets.map((asset) => (
                  <article key={asset.name} className="asset-card">
                    <h3>{asset.name}</h3>
                    <p className="asset-meta">
                      {asset.assetType} · {asset.mimeType}
                    </p>
                    <pre>{asset.content}</pre>
                  </article>
                ))}
              </div>
            </div>
          ) : null}
        </article>

        <button
          className={`problem-pane-divider ${dragging ? "is-dragging" : ""}`}
          type="button"
          aria-label="Resize problem and editor panels"
          onPointerDown={handleDragStart}
        >
          <span aria-hidden />
        </button>

        <div className="problem-pane-right">
          <ProblemWorkbench problem={problem} />
        </div>
      </div>
    </section>
  );
}
