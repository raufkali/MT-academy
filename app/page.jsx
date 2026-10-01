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
  Headphones,
  Shield,
  Zap,
  MessageCircle,
} from "lucide-react";

/* ONLY TWO COLORS: NAVY + WHITE, expressed via surface shifts */
const colors = {
  navy: "#0F2F50",
  navyLight: "#1A4A7A",
  white: "#FFFFFF",
  surface: "#F5F7FA",
  surfaceAlt: "#EDF1F6",
  divider: "#E1E7ED",
  muted: "#5A6B7D",
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

function SectionHeading({
  eyebrow,
  title,
  description,
  center = false,
  light = false,
}) {
  const headingColor = light ? colors.white : colors.navy;
  const textColor = light ? "rgba(255,255,255,0.75)" : colors.muted;
  const ruleColor = light ? "rgba(255,255,255,0.4)" : colors.navy;

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
          style={{
            width: "24px",
            height: "1px",
            background: ruleColor,
          }}
        />
        <span
          className="text-uppercase fw-bold"
          style={{
            fontSize: "0.75rem",
            letterSpacing: "2px",
            color: headingColor,
            fontFamily: "Inter, sans-serif",
          }}
        >
          {eyebrow}
        </span>
      </div>

      <h2
        className="amarante-regular mb-3"
        style={{
          color: headingColor,
          fontSize: "clamp(1.65rem, 3vw, 2.35rem)",
          letterSpacing: "0.02em",
        }}
      >
        {title}
      </h2>

      {description && (
        <p
          className="mb-0"
          style={{
            color: textColor,
            lineHeight: 1.8,
            fontSize: "0.98rem",
            fontFamily: "Inter, sans-serif",
          }}
        >
          {description}
        </p>
      )}
    </div>
  );
}

function PrimaryButton({ href, children, outline = false, onNavy = false }) {
  let bg, border, color;
  if (onNavy) {
    bg = colors.white;
    border = colors.white;
    color = colors.navy;
  } else if (outline) {
    bg = colors.white;
    border = colors.navy;
    color = colors.navy;
  } else {
    bg = colors.navy;
    border = colors.navy;
    color = colors.white;
  }

  return (
    <Link
      href={href}
      className="btn d-inline-flex align-items-center justify-content-center gap-2 fw-semibold"
      style={{
        borderRadius: 0,
        padding: "13px 22px",
        fontSize: "0.94rem",
        background: bg,
        border: `1px solid ${border}`,
        color: color,
        boxShadow: "none",
        whiteSpace: "normal",
        fontFamily: "Inter, sans-serif",
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
      {/* WHITE CARD on off-white section — no border, just surface contrast */}
      <div
        className="h-100"
        style={{
          background: colors.white,
          borderRadius: 0,
          border: 0,
          boxShadow: "none",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div className="p-4 d-flex flex-column h-100">
          <div className="d-flex align-items-start justify-content-between mb-4">
            <div
              className="d-flex align-items-center justify-content-center"
              style={{
                width: "54px",
                height: "54px",
                background: colors.surface,
                color: colors.navy,
              }}
            >
              <Icon size={26} strokeWidth={1.8} />
            </div>

            <span
              className="px-3 py-2"
              style={{
                background: colors.surface,
                color: colors.navy,
                fontSize: "0.7rem",
                fontWeight: 600,
                letterSpacing: "1px",
                textTransform: "uppercase",
              }}
            >
              {exam.tag}
            </span>
          </div>

          <h3
            className="amarante-regular mb-2"
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
              color: colors.navy,
              fontFamily: "Inter, sans-serif",
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
              fontFamily: "Inter, sans-serif",
              flexGrow: 1,
            }}
          >
            {exam.description}
          </p>

          <div
            className="d-flex flex-wrap align-items-center gap-3 py-3 mb-3"
            style={{ borderTop: `1px solid ${colors.divider}` }}
          >
            <div className="d-flex align-items-center gap-2">
              <BookOpen size={16} color={colors.navy} />
              <span
                className="fw-semibold"
                style={{
                  fontSize: "0.82rem",
                  color: colors.navy,
                  fontFamily: "Inter, sans-serif",
                }}
              >
                {exam.questions} MCQs
              </span>
            </div>

            <div className="d-flex align-items-center gap-2">
              <Clock3 size={16} color={colors.navy} />
              <span
                className="fw-semibold"
                style={{
                  fontSize: "0.82rem",
                  color: colors.navy,
                  fontFamily: "Inter, sans-serif",
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
              color: colors.navy,
              fontSize: "0.9rem",
              fontFamily: "Inter, sans-serif",
            }}
          >
            Start Preparation
            <span
              className="d-flex align-items-center justify-content-center"
              style={{
                width: "34px",
                height: "34px",
                background: colors.surface,
                color: colors.navy,
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
        background: colors.white,
        color: colors.navy,
        overflowX: "hidden",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* HERO — white */}
      <section
        style={{
          background: colors.white,
        }}
      >
        <div className="container py-5">
          <div className="row align-items-center g-5 py-lg-4">
            <div className="col-12 col-lg-7">
              <h1
                className="amarante-regular mb-4"
                style={{
                  color: colors.navy,
                  fontSize: "clamp(2.25rem, 5vw, 3.8rem)",
                  lineHeight: 1.14,
                  letterSpacing: "0.02em",
                  maxWidth: "690px",
                }}
              >
                Prepare Today.
                <br />
                Perform with Confidence.
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
                      borderRadius: 0,
                      padding: "13px 22px",
                      fontSize: "0.94rem",
                      background: colors.white,
                      border: `1px solid ${colors.navy}`,
                      color: colors.navy,
                      boxShadow: "none",
                      whiteSpace: "normal",
                      textDecoration: "none",
                      fontFamily: "Inter, sans-serif",
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
                  borderTop: `1px solid ${colors.divider}`,
                  maxWidth: "620px",
                }}
              >
                {[
                  "Timed Mock Tests",
                  "Instant Results",
                  "Progress Autosave",
                ].map((item) => (
                  <div key={item} className="d-flex align-items-center gap-2">
                    <CheckCircle2
                      size={17}
                      color={colors.navy}
                      strokeWidth={2}
                    />
                    <span
                      className="fw-semibold"
                      style={{
                        fontSize: "0.78rem",
                        color: colors.navy,
                      }}
                    >
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Examination Overview — NAVY block for contrast */}
            <div className="col-12 col-lg-5">
              <div
                style={{
                  background: colors.navy,
                  color: colors.white,
                }}
              >
                <div className="p-4">
                  <div className="d-flex align-items-center justify-content-between mb-4">
                    <div>
                      <span
                        className="amarante-regular d-block mb-1"
                        style={{
                          color: colors.white,
                          fontSize: "1.05rem",
                        }}
                      >
                        Examination Overview
                      </span>
                      <span
                        style={{
                          color: "rgba(255,255,255,0.7)",
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
                        background: "rgba(255,255,255,0.1)",
                        color: colors.white,
                      }}
                    >
                      <ShieldCheck size={24} />
                    </div>
                  </div>

                  {/* Inset summary — lighter navy */}
                  <div
                    className="p-3 mb-3"
                    style={{ background: "rgba(255,255,255,0.06)" }}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <span
                          className="d-block mb-1"
                          style={{
                            fontSize: ".8rem",
                            color: "rgba(255,255,255,0.7)",
                          }}
                        >
                          Full Mock Examination
                        </span>
                        <div className="d-flex align-items-baseline gap-2">
                          <span
                            className="amarante-regular"
                            style={{
                              fontSize: "2rem",
                              lineHeight: 1.2,
                              color: colors.white,
                            }}
                          >
                            198
                          </span>
                          <span
                            style={{
                              fontSize: ".8rem",
                              color: "rgba(255,255,255,0.7)",
                            }}
                          >
                            Total MCQs
                          </span>
                        </div>
                      </div>

                      <div className="text-end">
                        <Clock3
                          size={22}
                          className="mb-2"
                          color={colors.white}
                        />
                        <span
                          className="amarante-regular d-block"
                          style={{ fontSize: "1rem", color: colors.white }}
                        >
                          90 min
                        </span>
                      </div>
                    </div>

                    <div
                      className="progress mt-3"
                      style={{
                        height: "3px",
                        background: "rgba(255,255,255,.2)",
                        border: "none",
                      }}
                    >
                      <div
                        className="progress-bar"
                        style={{ width: "100%", background: colors.white }}
                      />
                    </div>

                    <div
                      className="d-flex justify-content-between mt-2"
                      style={{
                        fontSize: ".7rem",
                        color: "rgba(255,255,255,0.6)",
                      }}
                    >
                      <span>3 Examination Modules</span>
                      <span>100% Coverage</span>
                    </div>
                  </div>

                  {/* Modules list — white/10 tiles */}
                  <div className="d-flex flex-column gap-2">
                    {exams.map((exam) => {
                      const Icon = exam.icon;
                      return (
                        <Link
                          href="/login"
                          key={exam.title}
                          className="d-flex align-items-center gap-3 text-decoration-none p-3"
                          style={{
                            background: "rgba(255,255,255,0.06)",
                            color: colors.white,
                            border: 0,
                          }}
                        >
                          <div
                            className="d-flex align-items-center justify-content-center flex-shrink-0"
                            style={{
                              width: "40px",
                              height: "40px",
                              background: "rgba(255,255,255,0.1)",
                              color: colors.white,
                            }}
                          >
                            <Icon size={20} />
                          </div>

                          <div className="flex-grow-1">
                            <span
                              className="d-block fw-bold mb-1"
                              style={{
                                fontSize: ".85rem",
                                color: colors.white,
                              }}
                            >
                              {exam.title}
                            </span>
                            <span
                              style={{
                                fontSize: ".76rem",
                                color: "rgba(255,255,255,0.6)",
                              }}
                            >
                              {exam.questions} MCQs • {exam.duration}
                            </span>
                          </div>

                          <ChevronRight
                            size={16}
                            color="rgba(255,255,255,0.6)"
                          />
                        </Link>
                      );
                    })}
                  </div>

                  <div
                    className="d-flex align-items-center justify-content-center gap-2 mt-4 pt-3"
                    style={{
                      borderTop: "1px solid rgba(255,255,255,0.12)",
                      color: "rgba(255,255,255,0.7)",
                      fontSize: ".78rem",
                    }}
                  >
                    <Shield size={15} color={colors.white} />
                    Server-timed sessions with autosave
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK STATS — off-white surface strip */}
      <section style={{ background: colors.surface }}>
        <div className="container">
          <div className="row g-0">
            {[
              { icon: BookOpen, number: "198", label: "Practice MCQs" },
              { icon: Clock3, number: "90 min", label: "Full Mock Duration" },
              { icon: Target, number: "3", label: "Test Modules" },
              {
                icon: ChartNoAxesCombined,
                number: "100%",
                label: "Self-Paced Preparation",
              },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div className="col-6 col-lg-3" key={stat.label}>
                  <div
                    className="p-3 p-md-4 text-center"
                    style={{
                      background: colors.white,
                      margin: "1px",
                    }}
                  >
                    <Icon size={23} color={colors.navy} className="mb-2" />
                    <div
                      className="amarante-regular mb-1"
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
        </div>
      </section>

      {/* EXAM MODULES — off-white section, white cards */}
      <section className="py-5" style={{ background: colors.surface }}>
        <div className="container py-lg-3">
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
        </div>
      </section>

      {/* FULL MOCK CTA — WHITE section, navy inner block for emphasis */}
      <section className="py-5" style={{ background: colors.white }}>
        <div className="container">
          <div
            className="p-4 p-lg-5"
            style={{ background: colors.navy, color: colors.white }}
          >
            <div className="row align-items-center g-4">
              <div className="col-lg-8">
                <div className="d-flex align-items-start gap-3">
                  <div
                    className="d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{
                      width: "52px",
                      height: "52px",
                      background: "rgba(255,255,255,0.1)",
                      color: colors.white,
                    }}
                  >
                    <Zap size={26} />
                  </div>

                  <div>
                    <h3
                      className="amarante-regular mb-2"
                      style={{ color: colors.white, fontSize: "1.35rem" }}
                    >
                      Ready for the Full Mock Test?
                    </h3>

                    <p
                      className="mb-0"
                      style={{
                        color: "rgba(255,255,255,0.75)",
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
                <PrimaryButton href="/login" onNavy>
                  Access Full Mock Test
                  <ArrowRight size={18} />
                </PrimaryButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES — off-white section, white tiles */}
      <section className="py-5" style={{ background: colors.surface }}>
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
                    className="h-100 p-4"
                    style={{
                      background: colors.white,
                      border: 0,
                    }}
                  >
                    <div
                      className="d-flex align-items-center justify-content-center mb-3"
                      style={{
                        width: "50px",
                        height: "50px",
                        background: colors.surface,
                        color: colors.navy,
                      }}
                    >
                      <Icon size={24} />
                    </div>

                    <h4
                      className="amarante-regular mb-2"
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

      {/* HOW TO GET ACCESS — white section, off-white tiles */}
      <section className="py-5" style={{ background: colors.white }}>
        <div className="container">
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
                    className="h-100 p-4"
                    style={{
                      background: colors.surface,
                      border: 0,
                    }}
                  >
                    <div className="d-flex justify-content-between mb-4">
                      <div
                        className="d-flex align-items-center justify-content-center"
                        style={{
                          width: "54px",
                          height: "54px",
                          background: colors.white,
                          color: colors.navy,
                        }}
                      >
                        <Icon size={25} />
                      </div>

                      <span
                        className="amarante-regular"
                        style={{
                          fontSize: "1.65rem",
                          color: colors.navy,
                          opacity: 0.25,
                        }}
                      >
                        {step.number}
                      </span>
                    </div>

                    <h3
                      className="amarante-regular mb-3"
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
        </div>
      </section>

      {/* SUPPORT — navy block */}
      <section className="py-5" style={{ background: colors.surface }}>
        <div className="container">
          <div
            className="p-4 p-lg-5"
            style={{ background: colors.navy, color: colors.white }}
          >
            <div className="row align-items-center g-4">
              <div className="col-lg-8">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <Headphones size={19} color={colors.white} />
                  <span
                    className="text-uppercase fw-bold"
                    style={{
                      color: colors.white,
                      fontSize: ".75rem",
                      letterSpacing: "2px",
                    }}
                  >
                    Candidate Support
                  </span>
                </div>

                <h3
                  className="amarante-regular mb-2"
                  style={{
                    color: colors.white,
                    fontSize: "clamp(1.3rem, 3vw, 1.9rem)",
                  }}
                >
                  Need Help Getting Started?
                </h3>

                <p
                  className="mb-0"
                  style={{
                    color: "rgba(255,255,255,0.75)",
                    fontSize: ".9rem",
                    lineHeight: 1.8,
                    maxWidth: "550px",
                  }}
                >
                  For payment verification, temporary credentials or
                  access-related questions, contact the platform administrator.
                </p>
              </div>

              <div className="col-lg-4 text-lg-end">
                <PrimaryButton href="/contact" onNavy>
                  Contact Support
                  <ArrowRight size={18} />
                </PrimaryButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER — white */}
      <footer
        className="mt-auto pt-5 pb-4"
        style={{
          background: colors.white,
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
                    background: colors.navy,
                    color: colors.white,
                  }}
                >
                  <ShieldCheck size={22} />
                </div>

                <span
                  className="amarante-regular"
                  style={{
                    color: colors.navy,
                    fontSize: "1.15rem",
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
              <h6
                className="amarante-regular mb-3"
                style={{ color: colors.navy }}
              >
                Quick Links
              </h6>

              <div className="d-flex flex-column gap-2">
                <Link
                  href="/about"
                  className="text-decoration-none"
                  style={{ color: colors.muted, fontSize: ".85rem" }}
                >
                  About Us
                </Link>
                <Link
                  href="/contact"
                  className="text-decoration-none"
                  style={{ color: colors.muted, fontSize: ".85rem" }}
                >
                  Contact Us
                </Link>
                <Link
                  href="/dashboard"
                  className="text-decoration-none"
                  style={{ color: colors.muted, fontSize: ".85rem" }}
                >
                  Candidate Portal
                </Link>
                <Link
                  href="/login"
                  className="text-decoration-none"
                  style={{ color: colors.muted, fontSize: ".85rem" }}
                >
                  Candidate Login
                </Link>
              </div>
            </div>

            <div className="col-6 col-lg-3">
              <h6
                className="amarante-regular mb-3"
                style={{ color: colors.navy }}
              >
                Platform
              </h6>

              <div className="d-flex flex-column gap-2">
                <span style={{ color: colors.muted, fontSize: ".85rem" }}>
                  Verbal Intelligence
                </span>
                <span style={{ color: colors.muted, fontSize: ".85rem" }}>
                  Non-Verbal Intelligence
                </span>
                <span style={{ color: colors.muted, fontSize: ".85rem" }}>
                  Academic Preparation
                </span>
              </div>
            </div>
          </div>

          <div
            className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-2 mt-4 pt-4"
            style={{ borderTop: `1px solid ${colors.divider}` }}
          >
            <p
              className="mb-0 text-center text-md-start"
              style={{ color: colors.muted, fontSize: ".78rem" }}
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

      {/* FLOATING WHATSAPP BUTTON — navy, on-brand */}
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
            background: colors.navy,
            color: colors.white,
            zIndex: 1030,
            textDecoration: "none",
          }}
        >
          <MessageCircle size={29} strokeWidth={2.2} />
        </a>
      )}
    </main>
  );
}
