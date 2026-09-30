import Link from "next/link";
import { ArrowRight, BookOpen, ShieldCheck, Target, Users } from "lucide-react";

export const metadata = {
  title: "About Us | MTacademy",
  description:
    "Learn about MTacademy and our approach to structured PMA mock test preparation.",
};

export default function AboutPage() {
  return (
    <main style={{ backgroundColor: "#F5FAFE" }}>
      {/* Header */}
      <section
        style={{
          background: "linear-gradient(180deg, #F0F9FF 0%, #FFFFFF 100%)",
          padding: "70px 0",
        }}
      >
        <div className="container text-center">
          <span className="fw-bold small" style={{ color: "#0284C7" }}>
            ABOUT MTACADEMY
          </span>

          <h1
            className="fw-bold mt-2 mb-3"
            style={{
              color: "#0F3B5D",
              fontSize: "clamp(2rem, 5vw, 3.4rem)",
            }}
          >
            Preparing Candidates With Purpose
          </h1>

          <p
            className="text-secondary mx-auto"
            style={{
              maxWidth: "720px",
              lineHeight: 1.8,
              fontSize: "1.05rem",
            }}
          >
            MTacademy is a dedicated mock test platform providing PMA Long Course
            candidates with a disciplined, structured, and realistic environment for
            examination excellence.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-5 bg-white">
        <div className="container py-lg-4">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <div
                className="rounded-4 p-4 p-md-5"
                style={{ backgroundColor: "#F0F9FF" }}
              >
                <Target size={38} color="#0284C7" className="mb-4" />

                <h2 className="fw-bold mb-3" style={{ color: "#0F3B5D" }}>
                  Our Purpose
                </h2>

                <p className="text-secondary mb-0" style={{ lineHeight: 1.9 }}>
                  Our goal is to make mock-test practice more organized and
                  accessible. Candidates should be able to focus on answering
                  questions, managing time, and understanding their performance
                  without unnecessary complexity.
                </p>
              </div>
            </div>

            <div className="col-lg-6">
              <span className="fw-bold small" style={{ color: "#0284C7" }}>
                OUR APPROACH
              </span>

              <h2 className="fw-bold mt-2 mb-3" style={{ color: "#0F3B5D" }}>
                A Clearer Way to Practice
              </h2>

              <p className="text-secondary" style={{ lineHeight: 1.8 }}>
                MTacademy combines structured question banks, server-timed assessments,
                controlled candidate credentials, and performance analytics into one
                straightforward platform.
              </p>

              <p className="text-secondary" style={{ lineHeight: 1.8 }}>
                The platform is designed to support preparation rather than
                replace official examination processes or guidance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-5">
        <div className="container py-lg-4">
          <div className="text-center mb-5">
            <h2 className="fw-bold" style={{ color: "#0F3B5D" }}>
              What We Focus On
            </h2>
          </div>

          <div className="row g-4">
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
                <div className="col-md-4" key={item.title}>
                  <div
                    className="bg-white border rounded-4 p-4 h-100"
                    style={{
                      borderColor: "#E2E8F0",
                      boxShadow: "0 8px 24px rgba(15,59,93,0.04)",
                    }}
                  >
                    <div
                      className="rounded-3 d-flex align-items-center justify-content-center mb-4"
                      style={{
                        width: "50px",
                        height: "50px",
                        backgroundColor: "#E0F2FE",
                        color: "#0284C7",
                      }}
                    >
                      <Icon size={24} />
                    </div>

                    <h5 className="fw-bold" style={{ color: "#0F3B5D" }}>
                      {item.title}
                    </h5>

                    <p className="text-secondary mb-0">{item.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-5">
        <div className="container">
          <div
            className="rounded-4 p-4 p-md-5 text-center"
            style={{
              backgroundColor: "#0F3B5D",
            }}
          >
            <h2 className="text-white fw-bold mb-3">Start Your Preparation</h2>

            <p
              className="mx-auto mb-4"
              style={{
                color: "#D8F3FF",
                maxWidth: "600px",
              }}
            >
              Sign in with your temporary candidate credentials to access your mock examination.
            </p>

            <Link
              href="/login"
              className="btn d-inline-flex align-items-center gap-2"
              style={{
                backgroundColor: "#38BDF8",
                color: "#0F3B5D",
                border: "none",
                borderRadius: "10px",
                padding: "12px 22px",
                fontWeight: 800,
              }}
            >
              Candidate Login
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
