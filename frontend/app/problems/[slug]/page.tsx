import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { SiteHeader } from "@/components/site-header";
import { ProblemWorkbench } from "@/components/problem-workbench";
import { getProblemServer } from "@/lib/server-api";

type PageProps = {
  params: Promise<{ slug: string }>;
};

function difficultyClass(difficulty: string): string {
  switch (difficulty.toLowerCase()) {
    case "easy":
      return "badge badge-easy";
    case "hard":
      return "badge badge-hard";
    default:
      return "badge badge-medium";
  }
}

export default async function ProblemDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const problem = await getProblemServer(slug);

  if (!problem) {
    notFound();
  }

  return (
    <div className="site-root">
      <SiteHeader />
      <main className="container problem-page">
        <div className="problem-page-head">
          <div>
            <p className="eyebrow">Problem</p>
            <h1>{problem.title}</h1>
            <p>{problem.shortDescription}</p>
          </div>
          <Link href="/problems" className="btn btn-muted">
            Back to Catalog
          </Link>
        </div>

        <div className="problem-meta-row">
          <span className={difficultyClass(problem.difficulty)}>{problem.difficulty}</span>
          <span className="badge badge-category">{problem.category}</span>
          <span className="badge badge-type">{problem.problemType}</span>
          {problem.tags.map((tag) => (
            <span key={tag} className="chip">
              {tag}
            </span>
          ))}
        </div>

        <section className="problem-workspace">
          <article className="problem-panel problem-panel-left">
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

          <ProblemWorkbench problem={problem} />
        </section>
      </main>
    </div>
  );
}
