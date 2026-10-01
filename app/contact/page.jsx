import { Clock, MessageCircle, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Contact Us",
  description:
    "Contact MTacademy for assistance with PMA mock tests, candidate access credentials, and test syllabus guidance.",
  alternates: {
    canonical: "https://mocktestsacademy.com/contact",
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

export default function ContactPage() {
  const phoneNumber = process.env.PHONE_NUMBER || "923487417875";
  const whatsappNumber = phoneNumber.replace(/\D/g, "");

  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        "Hello MTacademy, I need assistance regarding the PMA mock test platform.",
      )}`
    : null;

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
              Contact Us
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
            We're Here to Help
          </h1>

          <p
            className="mx-auto mb-0"
            style={{
              maxWidth: "620px",
              lineHeight: 1.85,
              fontSize: "clamp(0.9rem, 1.5vw, 1.02rem)",
              color: colors.muted,
            }}
          >
            Have a question about your test access or need assistance with
            MTacademy? Reach out directly through WhatsApp.
          </p>
        </div>
      </section>

      {/* ============================================================
          CONTACT CARD
          ============================================================ */}
      <section style={{ background: colors.surface, padding: "60px 0" }}>
        <div className="container px-3">
          <div className="row justify-content-center">
            <div className="col-12 col-lg-8">
              <div
                style={{
                  background: colors.white,
                  borderLeft: `3px solid ${colors.navy}`,
                  boxShadow: "0 1px 0 0 #E1E7ED, 0 0 0 1px #E1E7ED",
                  padding: "36px 28px",
                  textAlign: "center",
                }}
              >
                {/* Icon block */}
                <div
                  className="d-inline-flex align-items-center justify-content-center mb-4"
                  style={{
                    width: "64px",
                    height: "64px",
                    background: colors.navy,
                    color: colors.white,
                  }}
                >
                  <MessageCircle size={30} strokeWidth={1.8} />
                </div>

                <h2
                  className="amarante-regular mb-3"
                  style={{
                    color: colors.navy,
                    fontSize: "clamp(1.35rem, 2.5vw, 1.65rem)",
                    lineHeight: 1.2,
                  }}
                >
                  Contact Us on WhatsApp
                </h2>

                <p
                  className="mx-auto mb-4"
                  style={{
                    maxWidth: "520px",
                    lineHeight: 1.85,
                    fontSize: "0.88rem",
                    color: colors.muted,
                  }}
                >
                  Our WhatsApp contact is the quickest way to ask questions,
                  request assistance, or get help regarding your authorized test
                  access.
                </p>

                {whatsappUrl ? (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn d-inline-flex align-items-center justify-content-center gap-2"
                    style={{
                      background: colors.navy,
                      color: colors.white,
                      border: `1px solid ${colors.navy}`,
                      borderRadius: 0,
                      padding: "13px 26px",
                      fontWeight: 700,
                      fontSize: "0.85rem",
                      letterSpacing: "0.02em",
                      textDecoration: "none",
                    }}
                  >
                    <MessageCircle size={18} />
                    Chat on WhatsApp
                  </a>
                ) : (
                  <div
                    className="d-inline-block px-3 py-2"
                    style={{
                      background: colors.surface,
                      borderLeft: `3px solid ${colors.navy}`,
                      color: colors.navy,
                      fontSize: "0.82rem",
                    }}
                  >
                    WhatsApp contact is currently unavailable.
                  </div>
                )}

                {/* Feature strip */}
                <div className="row g-3 mt-4">
                  {[
                    { icon: MessageCircle, label: "Direct Support" },
                    { icon: Clock, label: "Quick Response" },
                    { icon: ShieldCheck, label: "Candidate Support" },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div className="col-12 col-md-4" key={item.label}>
                        <div
                          className="h-100 d-flex flex-column align-items-center justify-content-center"
                          style={{
                            background: colors.surface,
                            padding: "16px 12px",
                          }}
                        >
                          <Icon
                            size={20}
                            strokeWidth={1.9}
                            style={{ color: colors.navy, marginBottom: "8px" }}
                          />
                          <div
                            style={{
                              color: colors.navy,
                              fontWeight: 600,
                              fontSize: "0.8rem",
                              letterSpacing: "0.02em",
                            }}
                          >
                            {item.label}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          FOOTNOTE
          ============================================================ */}
      <section style={{ background: colors.white, padding: "40px 0" }}>
        <div className="container text-center px-3">
          <p
            className="mx-auto mb-0"
            style={{
              maxWidth: "620px",
              color: colors.muted,
              fontSize: "0.8rem",
              lineHeight: 1.75,
            }}
          >
            MTacademy is an independent educational service. Response times may
            vary during peak preparation periods.
          </p>
        </div>
      </section>
    </main>
  );
}
