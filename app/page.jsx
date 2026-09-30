import Link from "next/link";
import {
  ShieldCheck,
  Brain,
  Grid2X2,
  GraduationCap,
  Clock3,
  CheckCircle2,
  KeyRound,
  ArrowRight,
  Send,
  FileCheck2,
  Target,
  BookOpen,
  Timer,
  ChartNoAxesCombined,
  ChevronRight,
  Play,
  ClipboardCheck,
  Users,
  Headphones,
  Shield,
  Zap,
  MessageCircle,
} from "lucide-react";

const colors = {
  navy: "#0F2F50",
  blue: "#1769AA",
  sky: "#38BDF8",
  skyLight: "#EAF7FF",
  skyBorder: "#CDEBFC",
  text: "#34465A",
  muted: "#718096",
  bg: "#F5F9FD",
  border: "#E4EDF5",
  white: "#FFFFFF",
};

const exams = [
  {
    title: "Verbal Intelligence",
    subtitle: "Logical thinking & verbal reasoning",
    description:
      "Practice analogies, number series, coding-decoding, word relationships and verbal reasoning.",
    questions: 84,
    duration: "30 min",
    icon: Brain,
    color: "#0284C7",
    background: "#EAF7FF",
    tag: "Intelligence",
    href: "/login",
  },
  {
    title: "Non-Verbal Intelligence",
    subtitle: "Visual reasoning & pattern recognition",
    description:
      "Improve your visual reasoning with patterns, rotations, shapes, sequences and figure analysis.",
    questions: 64,
    duration: "30 min",
    icon: Grid2X2,
    color: "#6366F1",
    background: "#EEF0FF",
    tag: "Intelligence",
    href: "/login",
  },
  {
    title: "Academic Test",
    subtitle: "Subject-wise academic preparation",
    description:
      "Revise English, Mathematics, Physics, Chemistry and Pakistan Studies through MCQs.",
    questions: 50,
    duration: "30 min",
    icon: GraduationCap,
    color: "#08916D",
    background: "#E8FAF3",
    tag: "Academics",
    href: "/login",
  },
];

const features = [
  {
    icon: Timer,
    title: "Timed Examination",
    description:
      "Experience structured, time-limited mock sessions designed to help you practice under exam conditions.",
  },
  {
    icon: ClipboardCheck,
    title: "Instant Results",
    description:
      "Review your answers, scores and section-wise performance after completing your examination.",
  },
  {
    icon: ChartNoAxesCombined,
    title: "Performance Analysis",
    description:
      "Understand your strengths and identify topics that need more practice.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Test Sessions",
    description:
      "Server-managed timers and autosaving help protect your test progress.",
  },
];

function SectionHeading({ eyebrow, title, description, center = false }) {
  return (
    <div
      className={`mb-4 mb-lg-5 ${center ? "text-center mx-auto" : ""}`}
      style={{ maxWidth: center ? "680px" : "100%" }}
    >
      <div
        className={`d-flex align-items-center gap-2 mb-2 ${
          center ? "justify-content-center" : ""
        }`}
      >
        <span
          className="rounded-pill"
          style={{
            width: "24px",
            height: "3px",
            background: colors.sky,
          }}
        />

        <span
          className="text-uppercase fw-bold"
          style={{
            fontSize: "0.75rem",
            letterSpacing: "1.5px",
            color: colors.blue,
          }}
        >
          {eyebrow}
        </span>
      </div>

      <h2
        className="fw-bold mb-3"
        style={{
          color: colors.navy,
          fontSize: "clamp(1.65rem, 3vw, 2.35rem)",
          letterSpacing: "-0.8px",
        }}
      >
        {title}
      </h2>

      {description && (
        <p
          className="mb-0"
          style={{
            color: colors.muted,
            lineHeight: 1.8,
            fontSize: "0.98rem",
          }}
        >
          {description}
        </p>
      )}
    </div>
  );
}

function PrimaryButton({ href, children, outline = false }) {
  return (
    <Link
      href={href}
      className="btn d-inline-flex align-items-center justify-content-center gap-2 fw-semibold"
      style={{
        borderRadius: "12px",
        padding: "13px 22px",
        fontSize: "0.94rem",
        background: outline ? "#FFFFFF" : colors.blue,
        border: `1px solid ${colors.blue}`,
        color: outline ? colors.blue : "#FFFFFF",
        boxShadow: outline ? "none" : "0 6px 18px rgba(23,105,170,.16)",
        whiteSpace: "normal",
      }}
    >
      {children}
    </Link>
  );
}

function ExamCard({ exam }) {
  const Icon = exam.icon;

  return (
    <div className="col-12 col-md-6 col-lg-4">
      <div
        className="card h-100 border-0"
        style={{
          borderRadius: "20px",
          background: "#FFFFFF",
          boxShadow: "0 4px 24px rgba(15,47,80,.055)",
          border: `1px solid ${colors.border}`,
        }}
      >
        <div className="card-body p-4">
          <div className="d-flex align-items-start justify-content-between mb-4">
            <div
              className="d-flex align-items-center justify-content-center"
              style={{
                width: "54px",
                height: "54px",
                borderRadius: "16px",
                background: exam.background,
                color: exam.color,
              }}
            >
              <Icon size={26} strokeWidth={1.8} />
            </div>

            <span
              className="badge rounded-pill px-3 py-2"
              style={{
                background: "#F1F6FA",
                color: colors.text,
                fontSize: "0.7rem",
                fontWeight: 600,
              }}
            >
              {exam.tag}
            </span>
          </div>

          <h3
            className="fw-bold mb-2"
            style={{
              color: colors.navy,
              fontSize: "1.2rem",
            }}
          >
            {exam.title}
          </h3>

          <p
            className="mb-3"
            style={{
              fontSize: "0.84rem",
              fontWeight: 600,
              color: exam.color,
            }}
          >
            {exam.subtitle}
          </p>

          <p
            className="mb-4"
            style={{
              fontSize: "0.875rem",
              lineHeight: 1.8,
              color: colors.muted,
              minHeight: "75px",
            }}
          >
            {exam.description}
          </p>

          <div
            className="d-flex flex-wrap align-items-center gap-3 py-3 mb-3"
            style={{
              borderTop: `1px solid ${colors.border}`,
              borderBottom: `1px solid ${colors.border}`,
            }}
          >
            <div className="d-flex align-items-center gap-2">
              <BookOpen size={16} color={colors.blue} />

              <span
                className="fw-semibold"
                style={{
                  fontSize: "0.82rem",
                  color: colors.text,
                }}
              >
                {exam.questions} MCQs
              </span>
            </div>

            <div className="d-flex align-items-center gap-2">
              <Clock3 size={16} color={colors.blue} />

              <span
                className="fw-semibold"
                style={{
                  fontSize: "0.82rem",
                  color: colors.text,
                }}
              >
                {exam.duration}
              </span>
            </div>
          </div>

          <Link
            href={exam.href}
            className="d-flex align-items-center justify-content-between text-decoration-none fw-bold"
            style={{
              color: colors.blue,
              fontSize: "0.9rem",
            }}
          >
            Start Preparation
            <span
              className="d-flex align-items-center justify-content-center rounded-circle"
              style={{
                width: "34px",
                height: "34px",
                background: colors.skyLight,
              }}
            >
              <ArrowRight size={17} />
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  /*
   * PHONE_NUMBER is intentionally read on the server.
   * Therefore this page must remain a Server Component.
   */
  const phoneNumber = process.env.PHONE_NUMBER || "923487417875";

  const whatsappNumber = phoneNumber.replace(/\D/g, "");

  const whatsappMessage =
    "Hello MTacademy, I need assistance regarding the PMA mock test platform.";

  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        whatsappMessage,
      )}`
    : null;

  return (
    <main
      className="min-vh-100 d-flex flex-column"
      style={{
        background: colors.bg,
        color: colors.text,
        overflowX: "hidden",
      }}
    >
      {/* HERO */}
      <section
        className="position-relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #FFFFFF 0%, #F0F9FF 60%, #E5F5FF 100%)",
          borderBottom: `1px solid ${colors.skyBorder}`,
        }}
      >
        <div
          className="position-absolute rounded-circle d-none d-lg-block"
          style={{
            width: "380px",
            height: "380px",
            right: "-100px",
            top: "-160px",
            background: "rgba(56,189,248,.08)",
          }}
        />

        <div
          className="position-absolute rounded-circle d-none d-lg-block"
          style={{
            width: "250px",
            height: "250px",
            left: "-120px",
            bottom: "-150px",
            background: "rgba(23,105,170,.04)",
          }}
        />

        <div className="container position-relative py-5">
          <div className="row align-items-center g-5 py-lg-4">
            <div className="col-12 col-lg-7">
              <div
                className="d-inline-flex align-items-center gap-2 rounded-pill px-3 py-2 mb-4"
                style={{
                  background: "#FFFFFF",
                  border: `1px solid ${colors.skyBorder}`,
                  color: colors.blue,
                  boxShadow: "0 3px 12px rgba(15,47,80,.04)",
                }}
              >
                <span
                  className="rounded-circle"
                  style={{
                    width: "8px",
                    height: "8px",
                    background: colors.sky,
                  }}
                />

                <span
                  className="fw-bold"
                  style={{
                    fontSize: "0.73rem",
                    letterSpacing: ".4px",
                  }}
                >
                  MTACADEMY • PMA LONG COURSE PREPARATION
                </span>
              </div>

              <h1
                className="fw-bold mb-4"
                style={{
                  color: colors.navy,
                  fontSize: "clamp(2.25rem, 5vw, 3.8rem)",
                  lineHeight: 1.14,
                  letterSpacing: "-1.7px",
                  maxWidth: "690px",
                }}
              >
                Prepare Today.
                <br />
                <span style={{ color: colors.blue }}>
                  Perform with Confidence.
                </span>
              </h1>

              <p
                className="mb-4"
                style={{
                  maxWidth: "590px",
                  fontSize: "clamp(.95rem, 1.6vw, 1.08rem)",
                  color: colors.muted,
                  lineHeight: 1.9,
                }}
              >
                Your dedicated preparation platform for the PMA Long Course
                initial test. Practice intelligence and academic MCQs, take
                timed mock examinations, and understand your performance through
                detailed results.
              </p>

              <div className="d-flex flex-column flex-sm-row flex-wrap gap-3 mb-4">
                <PrimaryButton href="/login">
                  <Play size={18} fill="currentColor" />
                  Enter Candidate Portal
                  <ArrowRight size={17} />
                </PrimaryButton>

                {whatsappUrl ? (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn d-inline-flex align-items-center justify-content-center gap-2 fw-semibold"
                    style={{
                      borderRadius: "12px",
                      padding: "13px 22px",
                      fontSize: "0.94rem",
                      background: "#FFFFFF",
                      border: `1px solid ${colors.blue}`,
                      color: colors.blue,
                      boxShadow: "none",
                      whiteSpace: "normal",
                      textDecoration: "none",
                    }}
                  >
                    <MessageCircle size={18} />
                    Get Test Access
                  </a>
                ) : (
                  <PrimaryButton href="/contact" outline>
                    <MessageCircle size={18} />
                    Contact Support
                  </PrimaryButton>
                )}
              </div>

              <div
                className="d-flex flex-wrap align-items-center gap-3 gap-md-4 pt-3"
                style={{
                  borderTop: `1px solid ${colors.skyBorder}`,
                  maxWidth: "620px",
                }}
              >
                {[
                  "Timed Mock Tests",
                  "Instant Results",
                  "Progress Autosave",
                ].map((item) => (
                  <div key={item} className="d-flex align-items-center gap-2">
                    <CheckCircle2 size={17} color="#08916D" strokeWidth={2.2} />

                    <span
                      className="fw-semibold"
                      style={{
                        fontSize: "0.78rem",
                        color: colors.text,
                      }}
                    >
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Overview Card */}
            <div className="col-12 col-lg-5">
              <div
                className="card border-0"
                style={{
                  borderRadius: "24px",
                  background: "#FFFFFF",
                  boxShadow: "0 18px 60px rgba(15,47,80,.12)",
                  border: `1px solid ${colors.border}`,
                }}
              >
                <div className="card-body p-4">
                  <div className="d-flex align-items-center justify-content-between mb-4">
                    <div>
                      <span
                        className="d-block fw-bold mb-1"
                        style={{
                          color: colors.navy,
                          fontSize: "1.05rem",
                        }}
                      >
                        Examination Overview
                      </span>

                      <span
                        style={{
                          color: colors.muted,
                          fontSize: ".8rem",
                        }}
                      >
                        Your mock test structure
                      </span>
                    </div>

                    <div
                      className="d-flex align-items-center justify-content-center"
                      style={{
                        width: "46px",
                        height: "46px",
                        borderRadius: "14px",
                        background: colors.skyLight,
                        color: colors.blue,
                      }}
                    >
                      <ShieldCheck size={24} />
                    </div>
                  </div>

                  <div
                    className="rounded-4 p-3 mb-3"
                    style={{
                      background: "linear-gradient(120deg, #0F3B5D, #1769AA)",
                      color: "#FFFFFF",
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <span
                          className="d-block mb-1"
                          style={{
                            fontSize: ".8rem",
                            color: "#C9E9FF",
                          }}
                        >
                          Full Mock Examination
                        </span>

                        <div className="d-flex align-items-baseline gap-2">
                          <span
                            className="fw-bold"
                            style={{
                              fontSize: "2rem",
                              lineHeight: 1.2,
                            }}
                          >
                            198
                          </span>

                          <span
                            style={{
                              fontSize: ".8rem",
                              color: "#D9EDFF",
                            }}
                          >
                            Total MCQs
                          </span>
                        </div>
                      </div>

                      <div className="text-end">
                        <Clock3 size={22} className="mb-2" color="#BAE6FD" />

                        <span
                          className="d-block fw-bold"
                          style={{ fontSize: "1rem" }}
                        >
                          90 min
                        </span>
                      </div>
                    </div>

                    <div
                      className="progress mt-3"
                      style={{
                        height: "6px",
                        background: "rgba(255,255,255,.2)",
                      }}
                    >
                      <div
                        className="progress-bar"
                        style={{
                          width: "100%",
                          background: colors.sky,
                        }}
                      />
                    </div>

                    <div
                      className="d-flex justify-content-between mt-2"
                      style={{
                        fontSize: ".7rem",
                        color: "#D9EDFF",
                      }}
                    >
                      <span>3 Examination Modules</span>
                      <span>100% Coverage</span>
                    </div>
                  </div>

                  <div className="d-flex flex-column gap-3">
                    {exams.map((exam) => {
                      const Icon = exam.icon;

                      return (
                        <Link
                          href="/login"
                          key={exam.title}
                          className="d-flex align-items-center gap-3 text-decoration-none p-3 rounded-3"
                          style={{
                            border: `1px solid ${colors.border}`,
                            background: "#FFFFFF",
                          }}
                        >
                          <div
                            className="d-flex align-items-center justify-content-center flex-shrink-0"
                            style={{
                              width: "44px",
                              height: "44px",
                              borderRadius: "12px",
                              background: exam.background,
                              color: exam.color,
                            }}
                          >
                            <Icon size={21} />
                          </div>

                          <div className="flex-grow-1">
                            <span
                              className="d-block fw-bold mb-1"
                              style={{
                                fontSize: ".85rem",
                                color: colors.navy,
                              }}
                            >
                              {exam.title}
                            </span>

                            <span
                              style={{
                                fontSize: ".76rem",
                                color: colors.muted,
                              }}
                            >
                              {exam.questions} MCQs
                            </span>
                          </div>

                          <div className="text-end flex-shrink-0">
                            <span
                              className="badge rounded-pill mb-1"
                              style={{
                                background: colors.skyLight,
                                color: colors.blue,
                                fontSize: ".7rem",
                              }}
                            >
                              {exam.duration}
                            </span>

                            <ChevronRight
                              size={16}
                              color={colors.muted}
                              className="d-block ms-auto"
                            />
                          </div>
                        </Link>
                      );
                    })}
                  </div>

                  <div
                    className="d-flex align-items-center justify-content-center gap-2 mt-4 pt-3"
                    style={{
                      borderTop: `1px solid ${colors.border}`,
                      color: colors.muted,
                      fontSize: ".78rem",
                    }}
                  >
                    <Shield size={15} color="#08916D" />
                    Server-timed sessions with autosave
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK STATS */}
      <section className="container">
        <div
          className="row g-0 rounded-4 overflow-hidden"
          style={{
            background: "#FFFFFF",
            border: `1px solid ${colors.border}`,
            boxShadow: "0 8px 32px rgba(15,47,80,.045)",
          }}
        >
          {[
            {
              icon: BookOpen,
              number: "198",
              label: "Practice MCQs",
            },
            {
              icon: Clock3,
              number: "90 min",
              label: "Full Mock Duration",
            },
            {
              icon: Target,
              number: "3",
              label: "Test Modules",
            },
            {
              icon: ChartNoAxesCombined,
              number: "100%",
              label: "Self-Paced Preparation",
            },
          ].map((stat) => {
            const Icon = stat.icon;

            return (
              <div className="col-6 col-lg-3" key={stat.label}>
                <div className="p-3 p-md-4 text-center">
                  <Icon size={23} color={colors.blue} className="mb-2" />

                  <div
                    className="fw-bold mb-1"
                    style={{
                      fontSize: "1.55rem",
                      color: colors.navy,
                    }}
                  >
                    {stat.number}
                  </div>

                  <div
                    style={{
                      fontSize: ".76rem",
                      color: colors.muted,
                    }}
                  >
                    {stat.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* EXAM MODULES */}
      <section className="container py-5">
        <SectionHeading
          eyebrow="Practice & Improve"
          title="Choose Your Examination"
          description="Prepare for each section individually or use the full mock examination to practice your timing and test-taking skills."
        />

        <div className="row g-4">
          {exams.map((exam) => (
            <ExamCard exam={exam} key={exam.title} />
          ))}
        </div>

        <div
          className="mt-4 p-4 p-lg-5 rounded-4"
          style={{
            background: "linear-gradient(110deg, #EAF7FF 0%, #F5FAFF 100%)",
            border: `1px solid ${colors.skyBorder}`,
          }}
        >
          <div className="row align-items-center g-4">
            <div className="col-lg-8">
              <div className="d-flex align-items-start gap-3">
                <div
                  className="d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "15px",
                    background: "#FFFFFF",
                    color: colors.blue,
                  }}
                >
                  <Zap size={26} />
                </div>

                <div>
                  <h3
                    className="fw-bold mb-2"
                    style={{
                      color: colors.navy,
                      fontSize: "1.25rem",
                    }}
                  >
                    Ready for the Full Mock Test?
                  </h3>

                  <p
                    className="mb-0"
                    style={{
                      color: colors.muted,
                      lineHeight: 1.8,
                      fontSize: ".9rem",
                    }}
                  >
                    Combine all three examination modules into one 90-minute
                    practice session with 198 MCQs and review your performance
                    after submission.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-lg-4 text-lg-end">
              <PrimaryButton href="/login">
                Access Full Mock Test
                <ArrowRight size={18} />
              </PrimaryButton>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section
        className="py-5"
        style={{
          background: "#FFFFFF",
          borderTop: `1px solid ${colors.border}`,
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
        <div className="container py-lg-3">
          <SectionHeading
            eyebrow="Built for Your Preparation"
            title="Everything You Need to Practice"
            description="A structured testing environment designed to help candidates prepare, practice and track their progress."
            center
          />

          <div className="row g-4">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div className="col-12 col-sm-6 col-lg-3" key={feature.title}>
                  <div
                    className="h-100 p-4 rounded-4"
                    style={{
                      background: colors.bg,
                      border: `1px solid ${colors.border}`,
                    }}
                  >
                    <div
                      className="d-flex align-items-center justify-content-center mb-3"
                      style={{
                        width: "50px",
                        height: "50px",
                        borderRadius: "15px",
                        background: colors.skyLight,
                        color: colors.blue,
                      }}
                    >
                      <Icon size={24} />
                    </div>

                    <h4
                      className="fw-bold mb-2"
                      style={{
                        fontSize: "1.02rem",
                        color: colors.navy,
                      }}
                    >
                      {feature.title}
                    </h4>

                    <p
                      className="mb-0"
                      style={{
                        color: colors.muted,
                        fontSize: ".85rem",
                        lineHeight: 1.8,
                      }}
                    >
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* HOW TO GET ACCESS */}
      <section className="container py-5">
        <SectionHeading
          eyebrow="Getting Started"
          title="How to Get Test Access"
          description="Follow these three steps to register, receive your access code and begin your preparation."
          center
        />

        <div className="row g-4">
          {[
            {
              number: "01",
              icon: Send,
              title: "Complete Your Registration",
              description:
                "Contact MTacademy administration to submit your candidate details and verify mock test enrollment.",
            },
            {
              number: "02",
              icon: KeyRound,
              title: "Receive Candidate Credentials",
              description:
                "Receive your designated username and temporary password from the MTacademy administrator.",
            },
            {
              number: "03",
              icon: FileCheck2,
              title: "Start Your Examination",
              description:
                "Sign in with your temporary credentials to access your authorized mock test modules and begin testing.",
            },
          ].map((step) => {
            const Icon = step.icon;

            return (
              <div className="col-12 col-md-4" key={step.number}>
                <div
                  className="bg-white h-100 p-4 rounded-4"
                  style={{
                    border: `1px solid ${colors.border}`,
                    boxShadow: "0 4px 24px rgba(15,47,80,.04)",
                  }}
                >
                  <div className="d-flex justify-content-between mb-4">
                    <div
                      className="d-flex align-items-center justify-content-center"
                      style={{
                        width: "54px",
                        height: "54px",
                        borderRadius: "16px",
                        background: colors.skyLight,
                        color: colors.blue,
                      }}
                    >
                      <Icon size={25} />
                    </div>

                    <span
                      className="fw-bold"
                      style={{
                        fontSize: "1.65rem",
                        color: "#D8EAF7",
                      }}
                    >
                      {step.number}
                    </span>
                  </div>

                  <h3
                    className="fw-bold mb-3"
                    style={{
                      color: colors.navy,
                      fontSize: "1.1rem",
                    }}
                  >
                    {step.title}
                  </h3>

                  <p
                    className="mb-0"
                    style={{
                      color: colors.muted,
                      fontSize: ".875rem",
                      lineHeight: 1.85,
                    }}
                  >
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-5">
          <p
            className="mb-3"
            style={{
              color: colors.muted,
              fontSize: ".9rem",
            }}
          >
            Ready to begin your preparation?
          </p>

          <PrimaryButton href="/login">
            <Play size={18} />
            Sign In to Candidate Portal
            <ArrowRight size={17} />
          </PrimaryButton>
        </div>
      </section>

      {/* SUPPORT */}
      <section className="container pb-5">
        <div
          className="p-4 p-lg-5 rounded-4"
          style={{
            background: colors.navy,
          }}
        >
          <div className="row align-items-center g-4">
            <div className="col-lg-8">
              <div className="d-flex align-items-center gap-2 mb-3">
                <Headphones size={19} color={colors.sky} />

                <span
                  className="text-uppercase fw-bold"
                  style={{
                    color: colors.sky,
                    fontSize: ".75rem",
                    letterSpacing: "1px",
                  }}
                >
                  Candidate Support
                </span>
              </div>

              <h3
                className="fw-bold text-white mb-2"
                style={{
                  fontSize: "clamp(1.3rem, 3vw, 1.9rem)",
                }}
              >
                Need Help Getting Started?
              </h3>

              <p
                className="mb-0"
                style={{
                  color: "#C4D5E5",
                  fontSize: ".9rem",
                  lineHeight: 1.8,
                  maxWidth: "550px",
                }}
              >
                For payment verification, temporary credentials or access-related
                questions, contact the platform administrator.
              </p>
            </div>

            <div className="col-lg-4 text-lg-end">
              <Link
                href="/contact"
                className="btn d-inline-flex align-items-center justify-content-center gap-2 fw-semibold"
                style={{
                  background: colors.sky,
                  color: colors.navy,
                  borderRadius: "12px",
                  padding: "13px 22px",
                }}
              >
                Contact Support
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        className="mt-auto pt-5 pb-4"
        style={{
          background: "#FFFFFF",
          borderTop: `1px solid ${colors.border}`,
        }}
      >
        <div className="container">
          <div className="row g-4">
            <div className="col-12 col-lg-6">
              <Link
                href="/"
                className="d-inline-flex align-items-center gap-2 text-decoration-none mb-3"
              >
                <div
                  className="d-flex align-items-center justify-content-center"
                  style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "11px",
                    background: colors.navy,
                    color: "#FFFFFF",
                  }}
                >
                  <ShieldCheck size={22} />
                </div>

                <span
                  className="fw-bold"
                  style={{
                    color: colors.navy,
                    fontSize: "1.05rem",
                  }}
                >
                  MTacademy
                </span>
              </Link>

              <p
                className="mb-0"
                style={{
                  color: colors.muted,
                  fontSize: ".83rem",
                  lineHeight: 1.8,
                  maxWidth: "460px",
                }}
              >
                An independent educational preparation platform for PMA Long
                Course candidates, providing structured practice tests and
                examination preparation resources.
              </p>
            </div>

            <div className="col-6 col-lg-3">
              <h6 className="fw-bold mb-3" style={{ color: colors.navy }}>
                Quick Links
              </h6>

              <div className="d-flex flex-column gap-2">
                <Link
                  href="/about"
                  className="text-decoration-none"
                  style={{
                    color: colors.muted,
                    fontSize: ".85rem",
                  }}
                >
                  About Us
                </Link>

                <Link
                  href="/contact"
                  className="text-decoration-none"
                  style={{
                    color: colors.muted,
                    fontSize: ".85rem",
                  }}
                >
                  Contact Us
                </Link>

                <Link
                  href="/dashboard"
                  className="text-decoration-none"
                  style={{
                    color: colors.muted,
                    fontSize: ".85rem",
                  }}
                >
                  Candidate Portal
                </Link>

                <Link
                  href="/login"
                  className="text-decoration-none"
                  style={{
                    color: colors.muted,
                    fontSize: ".85rem",
                  }}
                >
                  Candidate Login
                </Link>
              </div>
            </div>

            <div className="col-6 col-lg-3">
              <h6 className="fw-bold mb-3" style={{ color: colors.navy }}>
                Platform
              </h6>

              <div className="d-flex flex-column gap-2">
                <span
                  style={{
                    color: colors.muted,
                    fontSize: ".85rem",
                  }}
                >
                  Verbal Intelligence
                </span>

                <span
                  style={{
                    color: colors.muted,
                    fontSize: ".85rem",
                  }}
                >
                  Non-Verbal Intelligence
                </span>

                <span
                  style={{
                    color: colors.muted,
                    fontSize: ".85rem",
                  }}
                >
                  Academic Preparation
                </span>
              </div>
            </div>
          </div>

          <div
            className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-2 mt-4 pt-4"
            style={{
              borderTop: `1px solid ${colors.border}`,
            }}
          >
            <p
              className="mb-0 text-center text-md-start"
              style={{
                color: colors.muted,
                fontSize: ".78rem",
              }}
            >
              © {new Date().getFullYear()} MTacademy. All rights reserved.
            </p>

            <span
              className="text-center"
              style={{
                color: colors.muted,
                fontSize: ".75rem",
                lineHeight: 1.7,
              }}
            >
              Independent educational service. Not affiliated with or endorsed
              by the Pakistan Military Academy or Pakistan Army.
            </span>
          </div>
        </div>
      </footer>

      {/* FLOATING WHATSAPP BUTTON */}
      {whatsappUrl && (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contact MTacademy on WhatsApp"
          className="d-flex align-items-center justify-content-center"
          style={{
            position: "fixed",
            right: "20px",
            bottom: "20px",
            width: "58px",
            height: "58px",
            borderRadius: "50%",
            background: "#25D366",
            color: "#FFFFFF",
            zIndex: 1030,
            textDecoration: "none",
            boxShadow: "0 8px 24px rgba(15,47,80,.22)",
            transition: "transform .2s ease, box-shadow .2s ease",
          }}
        >
          <MessageCircle size={29} strokeWidth={2.2} />
        </a>
      )}
    </main>
  );
}
