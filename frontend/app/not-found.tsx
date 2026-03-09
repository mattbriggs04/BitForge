import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

export default function NotFound() {
  return (
    <div className="site-root">
      <SiteHeader />
      <main className="container" style={{ paddingTop: "5rem", paddingBottom: "5rem" }}>
        <h1>Resource Not Found</h1>
        <p>The requested page or problem does not exist.</p>
        <Link href="/problems" className="btn btn-primary">
          Back to Problems
        </Link>
      </main>
    </div>
  );
}
