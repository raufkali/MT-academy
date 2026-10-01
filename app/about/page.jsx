import Link from "next/link";
import { ArrowRight, BookOpen, ShieldCheck, Target, Users } from "lucide-react";

export const metadata = {
  title: "About Us",
  description:
    "Learn about MTacademy and our structured preparation modules for PMA Long Course Verbal, Non-Verbal, and Academic tests.",
  alternates: {
    canonical: "https://mocktestsacademy.com/about",
  },
};

/* ============================================================
   THEME — navy + white only
   ============================================================ */
const colors = {
  navy: "#0F2F50",
  navyLight: "#1A4A7A",
  white: "#FFFFFF",
  surface: "#F5F7FA",
  surfaceAlt: "#EDF1F6",
  divider: "#E1E7ED",
  muted: "#5A6B7D",
};

export default function AboutPage() {
  return (
    <main
      style={{ background: colors.surface, width: "100%", overflowX: "hidden" }}
    >
      {/* ============================================================
          HEADER
          ============================================================ */}
      <section style={{ background: colors.white, padding: "60px 0" }}>
        <div className="container text-center px-3">
          <div
            className="d-inline-flex align-items-center gap-2 mb-3"
            style={{ color: colors.navy }}
          >
            <span
              style={{
                width: "24px",
                height: "1px",
                background: colors.navy,
              }}
            />
            <span
              className="fw-bold"
              style={{
                fontSize: "0.72rem",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
              }}
            >
              About MTacademy
            </span>
            <span
              style={{
                width: "24px",
                height: "1px",
                background: colors.navy,
              }}
            />
          </div>

          <h1
            className="amarante-regular mb-3 mx-auto"
            style={{
              color: colors.navy,
              fontSize: "clamp(1.75rem, 5vw, 3rem)",
              lineHeight: 1.15,
              maxWidth: "720px",
            }}
          >
            Preparing Candidates With Purpose
          </h1>

          <p
            className="mx-auto mb-0"
            style={{
              maxWidth: "680px",
              lineHeight: 1.85,
              fontSize: "clamp(0.9rem, 1.5vw, 1.05rem)",
              color: colors.muted,
            }}
          >
            MTacademy is a dedicated mock test platform providing PMA Long
            Course candidates with a disciplined, structured, and realistic
            environment for examination excellence.
          </p>
        </div>
      </section>

      {/* ============================================================
          MISSION
          ============================================================ */}
      <section style={{ background: colors.surface, padding: "60px 0" }}>
        <div className="container px-3">
          <div className="row align-items-center g-4 g-lg-5">
            {/* Purpose card */}
            <div className="col-12 col-lg-6">
              <div
                style={{
                  background: colors.white,
                  borderLeft: `3px solid ${colors.navy}`,
                  boxShadow: "0 1px 0 0 #E1E7ED, 0 0 0 1px #E1E7ED",
                  padding: "32px 28px",
                }}
              >
                <div
                  className="d-flex align-items-center justify-content-center mb-4"
                  style={{
                    width: "52px",
                    height: "52px",
                    background: colors.surface,
                    color: colors.navy,
                  }}
                >
                  <Target size={26} strokeWidth={1.8} />
                </div>

                <h2
                  className="amarante-regular mb-3"
                  style={{
                    color: colors.navy,
                    fontSize: "clamp(1.35rem, 2.5vw, 1.6rem)",
                    lineHeight: 1.2,
                  }}
                >
                  Our Purpose
                </h2>

                <p
                  className="mb-0"
                  style={{
                    color: colors.muted,
                    lineHeight: 1.85,
                    fontSize: "0.9rem",
                  }}
                >
                  Our goal is to make mock-test practice more organized and
                  accessible. Candidates should be able to focus on answering
                  questions, managing time, and understanding their performance
                  without unnecessary complexity.
                </p>
              </div>
            </div>

            {/* Approach text */}
            <div className="col-12 col-lg-6">
              <div
                className="d-inline-flex align-items-center gap-2 mb-2"
                style={{ color: colors.navy }}
              >
                <span
                  style={{
                    width: "20px",
                    height: "1px",
                    background: colors.navy,
                  }}
                />
                <span
                  className="fw-bold"
                  style={{
                    fontSize: "0.7rem",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                  }}
                >
                  Our Approach
                </span>
              </div>

              <h2
                className="amarante-regular mb-3"
                style={{
                  color: colors.navy,
                  fontSize: "clamp(1.35rem, 2.5vw, 1.6rem)",
                  lineHeight: 1.2,
                }}
              >
                A Clearer Way to Practice
              </h2>

              <p
                className="mb-3"
                style={{
                  color: colors.muted,
                  lineHeight: 1.85,
                  fontSize: "0.9rem",
                }}
              >
                MTacademy combines structured question banks, server-timed
                assessments, controlled candidate credentials, and performance
                analytics into one straightforward platform.
              </p>

              <p
                className="mb-0"
                style={{
                  color: colors.muted,
                  lineHeight: 1.85,
                  fontSize: "0.9rem",
                }}
              >
                The platform is designed to support preparation rather than
                replace official examination processes or guidance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          VALUES
          ============================================================ */}
      <section style={{ background: colors.white, padding: "60px 0" }}>
        <div className="container px-3">
          <div className="text-center mb-4 mb-md-5">
            <h2
              className="amarante-regular mb-2"
              style={{
                color: colors.navy,
                fontSize: "clamp(1.5rem, 3vw, 1.9rem)",
                lineHeight: 1.2,
              }}
            >
              What We Focus On
            </h2>
            <p
              className="mx-auto mb-0"
              style={{
                color: colors.muted,
                fontSize: "0.88rem",
                maxWidth: "520px",
                lineHeight: 1.7,
              }}
            >
              Three principles guide how we build and run the platform.
            </p>
          </div>

          <div className="row g-3 g-md-4">
            {[
              {
                icon: BookOpen,
                title: "Structured Learning",
                text: "Organized mock tests help candidates practice in a consistent environment.",
              },
              {
                icon: ShieldCheck,
                title: "Controlled Access",
                text: "Authorized test access helps keep examinations organized and protected.",
              },
              {
                icon: Users,
                title: "Candidate Experience",
                text: "The platform is built around a simple and clear candidate experience.",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div className="col-12 col-md-4" key={item.title}>
                  <div
                    className="h-100"
                    style={{
                      background: colors.white,
                      borderLeft: `3px solid ${colors.navy}`,
                      boxShadow: "0 1px 0 0 #E1E7ED, 0 0 0 1px #E1E7ED",
                      padding: "24px 22px",
                    }}
                  >
                    <div
                      className="d-flex align-items-center justify-content-center mb-3"
                      style={{
                        width: "48px",
                        height: "48px",
                        background: colors.surface,
                        color: colors.navy,
                      }}
                    >
                      <Icon size={22} strokeWidth={1.8} />
                    </div>

                    <h3
                      className="amarante-regular mb-2"
                      style={{
                        color: colors.navy,
                        fontSize: "1.1rem",
                        lineHeight: 1.25,
                      }}
                    >
                      {item.title}
                    </h3>

                    <p
                      className="mb-0"
                      style={{
                        color: colors.muted,
                        fontSize: "0.85rem",
                        lineHeight: 1.75,
                      }}
                    >
                      {item.text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================
          CTA — navy slab
          ============================================================ */}
      <section style={{ background: colors.surface, padding: "60px 0" }}>
        <div className="container px-3">
          <div
            className="text-center"
            style={{
              background: colors.navy,
              color: colors.white,
              padding: "48px 24px",
            }}
          >
            <h2
              className="amarante-regular mb-3"
              style={{
                color: colors.white,
                fontSize: "clamp(1.4rem, 3vw, 1.85rem)",
                lineHeight: 1.2,
              }}
            >
              Start Your Preparation
            </h2>

            <p
              className="mx-auto mb-4"
              style={{
                color: "rgba(255,255,255,0.75)",
                maxWidth: "560px",
                fontSize: "0.9rem",
                lineHeight: 1.8,
              }}
            >
              Sign in with your temporary candidate credentials to access your
              mock examination.
            </p>

            <Link
              href="/login"
              className="btn d-inline-flex align-items-center gap-2"
              style={{
                background: colors.white,
                color: colors.navy,
                border: `1px solid ${colors.white}`,
                borderRadius: 0,
                padding: "12px 24px",
                fontWeight: 700,
                fontSize: "0.85rem",
                letterSpacing: "0.02em",
                textDecoration: "none",
              }}
            >
              Candidate Login
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
