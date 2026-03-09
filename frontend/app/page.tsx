import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

const tracks = [
  {
    title: "Embedded C",
    description:
      "Pointer-heavy libc reimplementations, memory-safe APIs, and firmware-grade boundary handling.",
  },
  {
    title: "Networking",
    description:
      "Packet parsing, protocol field extraction, endian correctness, and defensive parser design.",
  },
  {
    title: "Debugging",
    description:
      "Reason about buggy C implementations, diagnose UB patterns, and isolate state-machine failures.",
  },
  {
    title: "Security",
    description:
      "Low-level memory behavior, integer edge cases, and exploit-adjacent defensive coding practice.",
  },
];

export default function Home() {
  return (
    <div className="site-root">
      <SiteHeader />
      <main>
        <section className="hero-section">
          <div className="container hero-grid">
            <div>
              <p className="eyebrow">Firmware and Systems Interview Prep</p>
              <h1>Practice real low-level engineering problems, not generic algorithm drills.</h1>
              <p className="hero-copy">
                BitForge is built for firmware, embedded, networking, and security candidates who need
                production-minded C exercises and interview-style feedback.
              </p>
              <div className="hero-actions">
                <Link className="btn btn-primary" href="/problems">
                  Start Practicing
                </Link>
                <a className="btn btn-muted" href="#tracks">
                  Explore Tracks
                </a>
              </div>
            </div>
            <div className="hero-panel">
              <p className="hero-panel-title">Current Problem Types</p>
              <ul>
                <li>C library reimplementation</li>
                <li>Ring buffer state transitions</li>
                <li>Packet header parsing</li>
                <li>Pointer/memory reasoning</li>
                <li>Debugging interview snippets</li>
              </ul>
              <p className="hero-panel-note">
                Hidden tests stay server-side. Runner architecture is designed for future sandbox hardening.
              </p>
            </div>
          </div>
        </section>

        <section id="tracks" className="section section-tracks">
          <div className="container">
            <div className="section-head">
              <h2>Systems-Focused Tracks</h2>
              <p>
                Problems are classified by practical low-level domains so you can train for the interviews you
                actually want.
              </p>
            </div>
            <div className="track-grid">
              {tracks.map((track) => (
                <article key={track.title} className="track-card">
                  <h3>{track.title}</h3>
                  <p>{track.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
