"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { ProblemDetail, Submission } from "@/lib/types";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => <div className="editor-loading">Loading editor...</div>,
});

type Props = {
  problem: ProblemDetail;
};

type SubmissionMode = "run" | "submit";

function formatVerdict(verdict: string): string {
  return verdict.replaceAll("_", " ");
}

function normalizeError(input: unknown): string {
  if (typeof input === "string") {
    return input;
  }
  return "Request failed";
}

async function fetchSubmission(submissionID: string): Promise<Submission> {
  const response = await fetch(`/api/backend/v1/submissions/${submissionID}`, {
    cache: "no-store",
  });

  const data = (await response.json()) as Submission | { error: string };
  if (!response.ok || "error" in data) {
    const message = "error" in data ? data.error : `Failed to load submission (${response.status})`;
    throw new Error(message);
  }
  return data;
}

export function ProblemWorkbench({ problem }: Props) {
  const defaultTemplate = useMemo(
    () => problem.languageTemplates.find((item) => item.language === "c") ?? problem.languageTemplates[0],
    [problem.languageTemplates],
  );

  const [code, setCode] = useState(defaultTemplate?.starterCode ?? "");
  const [submissionID, setSubmissionID] = useState<string>("");
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setCode(defaultTemplate?.starterCode ?? "");
  }, [defaultTemplate?.starterCode]);

  useEffect(() => {
    if (!submissionID) {
      return;
    }

    let active = true;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const poll = async (): Promise<void> => {
      try {
        const latest = await fetchSubmission(submissionID);
        if (!active) {
          return;
        }
        setSubmission(latest);
        if (latest.status === "queued" || latest.status === "running") {
          timer = setTimeout(poll, 1200);
        }
      } catch (pollErr) {
        if (!active) {
          return;
        }
        setError(pollErr instanceof Error ? pollErr.message : "Failed to poll submission");
      }
    };

    void poll();

    return () => {
      active = false;
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [submissionID]);

  const startSubmission = async (mode: SubmissionMode): Promise<void> => {
    if (!code.trim()) {
      setError("Source code is empty");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSubmission(null);

    try {
      const response = await fetch("/api/backend/v1/submissions", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-user-handle": "demo",
        },
        body: JSON.stringify({
          problemSlug: problem.slug,
          language: "c",
          mode,
          sourceCode: code,
        }),
      });

      const data = (await response.json()) as { submissionId?: string; error?: string };
      if (!response.ok || !data.submissionId) {
        throw new Error(data.error ?? `Submission failed (${response.status})`);
      }

      setSubmissionID(data.submissionId);
    } catch (submitErr) {
      setError(normalizeError(submitErr instanceof Error ? submitErr.message : submitErr));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="solve-section">
      <div className="solve-header">
        <h2>Solve</h2>
        <div className="solve-actions">
          <button className="btn btn-muted" type="button" onClick={() => setCode(defaultTemplate?.starterCode ?? "")}>
            Reset Starter
          </button>
          <button
            className="btn btn-muted"
            type="button"
            disabled={isSubmitting || (submission?.status === "queued" || submission?.status === "running")}
            onClick={() => void startSubmission("run")}
          >
            Run Samples
          </button>
          <button
            className="btn btn-primary"
            type="button"
            disabled={isSubmitting || (submission?.status === "queued" || submission?.status === "running")}
            onClick={() => void startSubmission("submit")}
          >
            Submit
          </button>
        </div>
      </div>

      <div className="editor-wrap">
        <MonacoEditor
          height="640px"
          language="c"
          theme="vs-dark"
          value={code}
          onChange={(value) => setCode(value ?? "")}
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            lineNumbersMinChars: 3,
            padding: { top: 16 },
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
        />
      </div>

      {defaultTemplate?.notes ? <p className="template-note">Template note: {defaultTemplate.notes}</p> : null}

      {error ? <p className="error-text">{error}</p> : null}

      {submission ? (
        <div className="result-panel">
          <div className="result-overview">
            <div>
              <span className="result-label">Status</span>
              <strong>{submission.status}</strong>
            </div>
            <div>
              <span className="result-label">Verdict</span>
              <strong>{formatVerdict(submission.verdict)}</strong>
            </div>
            <div>
              <span className="result-label">Tests</span>
              <strong>
                {submission.passedTests}/{submission.totalTests}
              </strong>
            </div>
            <div>
              <span className="result-label">Score</span>
              <strong>{submission.score}</strong>
            </div>
          </div>

          {submission.errorMessage ? <p className="error-text">{submission.errorMessage}</p> : null}

          {submission.compileOutput ? (
            <details>
              <summary>Compile Output</summary>
              <pre>{submission.compileOutput}</pre>
            </details>
          ) : null}

          {submission.runtimeOutput ? (
            <details>
              <summary>Runtime Output</summary>
              <pre>{submission.runtimeOutput}</pre>
            </details>
          ) : null}

          {submission.results.length > 0 ? (
            <table className="result-table">
              <thead>
                <tr>
                  <th>Case</th>
                  <th>Status</th>
                  <th>Message</th>
                </tr>
              </thead>
              <tbody>
                {submission.results.map((item) => (
                  <tr key={`${item.sortOrder}-${item.caseName}`}>
                    <td>{item.caseName}</td>
                    <td>{item.status}</td>
                    <td>{item.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
