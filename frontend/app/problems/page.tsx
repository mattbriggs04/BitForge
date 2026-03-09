import Link from "next/link";
import { ProblemCatalogFilters } from "@/components/problem-catalog-filters";
import { SiteHeader } from "@/components/site-header";
import { getProblemsServer } from "@/lib/server-api";
import { ProblemSummary } from "@/lib/types";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function readParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
): string {
  const value = params[key];
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }
  return value ?? "";
}

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

function unique(items: string[]): string[] {
  return [...new Set(items)].sort((a, b) => a.localeCompare(b));
}

export default async function ProblemsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const q = readParam(params, "q");
  const difficulty = readParam(params, "difficulty");
  const category = readParam(params, "category");
  const tag = readParam(params, "tag");

  const [problems, allProblems] = await Promise.all([
    getProblemsServer({ q, difficulty, category, tag }),
    getProblemsServer({}),
  ]);
  const categories = unique(allProblems.map((item) => item.category));
  const tags = unique(allProblems.flatMap((item) => item.tags));

  return (
    <div className="site-root">
      <SiteHeader />
      <main className="container catalog-page">
        <section className="catalog-header">
          <div>
            <p className="eyebrow">Problem Catalog</p>
            <h1>Systems Interview Problem Set</h1>
            <p>
              Search and filter by domain focus, difficulty, and tags. All current problems provide C templates.
            </p>
          </div>
          <Link className="btn btn-primary" href="/">
            Back to Landing
          </Link>
        </section>

        <ProblemCatalogFilters
          key={`${q}|${difficulty}|${category}|${tag}`}
          q={q}
          difficulty={difficulty}
          category={category}
          tag={tag}
          categories={categories}
          tags={tags}
        />

        <section className="problem-grid">
          {problems.length === 0 ? (
            <article className="empty-state">No problems matched your filter set.</article>
          ) : (
            problems.map((problem: ProblemSummary) => (
              <article key={problem.id} className="problem-card">
                <div className="problem-card-head">
                  <span className={difficultyClass(problem.difficulty)}>{problem.difficulty}</span>
                  <span className="badge badge-category">{problem.category}</span>
                </div>
                <h2>{problem.title}</h2>
                <p>{problem.shortDescription}</p>
                <div className="chip-row">
                  {problem.tags.map((item) => (
                    <span key={item} className="chip">
                      {item}
                    </span>
                  ))}
                </div>
                <Link href={`/problems/${problem.slug}`} className="btn btn-muted card-cta">
                  Open Problem
                </Link>
              </article>
            ))
          )}
        </section>
      </main>
    </div>
  );
}
