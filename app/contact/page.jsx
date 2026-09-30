import { Clock, MessageCircle, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Contact Us | MTacademy",
  description:
    "Contact MTacademy for assistance with PMA mock tests and candidate access.",
};

export default function ContactPage() {
  const phoneNumber = process.env.PHONE_NUMBER || "923487417875";

  const whatsappNumber = phoneNumber.replace(/\D/g, "");

  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        "Hello MTacademy, I need assistance regarding the PMA mock test platform.",
      )}`
    : "#";

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
            CONTACT US
          </span>

          <h1
            className="fw-bold mt-2 mb-3"
            style={{
              color: "#0F3B5D",
              fontSize: "clamp(2rem, 5vw, 3.4rem)",
            }}
          >
            We're Here to Help
          </h1>

          <p
            className="text-secondary mx-auto"
            style={{
              maxWidth: "650px",
              lineHeight: 1.8,
            }}
          >
            Have a question about your test access or need assistance with MTacademy?
            Contact us directly through WhatsApp.
          </p>
        </div>
      </section>

      {/* Contact */}
      <section className="py-5">
        <div className="container py-lg-4">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div
                className="bg-white rounded-4 border p-4 p-md-5 text-center"
                style={{
                  borderColor: "#E2E8F0",
                  boxShadow: "0 12px 35px rgba(15,59,93,0.06)",
                }}
              >
                <div
                  className="mx-auto mb-4 rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: "75px",
                    height: "75px",
                    backgroundColor: "#DCFCE7",
                    color: "#16A34A",
                  }}
                >
                  <MessageCircle size={36} />
                </div>

                <h2 className="fw-bold mb-3" style={{ color: "#0F3B5D" }}>
                  Contact Us on WhatsApp
                </h2>

                <p
                  className="text-secondary mx-auto mb-4"
                  style={{
                    maxWidth: "580px",
                    lineHeight: 1.8,
                  }}
                >
                  Our WhatsApp contact is the quickest way to ask questions,
                  request assistance, or get help regarding your authorized test
                  access.
                </p>

                {whatsappNumber ? (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn d-inline-flex align-items-center justify-content-center gap-2"
                    style={{
                      backgroundColor: "#16A34A",
                      color: "#FFFFFF",
                      border: "none",
                      borderRadius: "11px",
                      padding: "13px 24px",
                      fontWeight: 700,
                    }}
                  >
                    <MessageCircle size={19} />
                    Chat on WhatsApp
                  </a>
                ) : (
                  <div className="alert alert-warning mb-0" role="alert">
                    WhatsApp contact is currently unavailable.
                  </div>
                )}

                <div className="row g-3 mt-4">
                  <div className="col-md-4">
                    <div
                      className="p-3 rounded-3 h-100"
                      style={{ backgroundColor: "#F8FAFC" }}
                    >
                      <MessageCircle
                        size={20}
                        color="#0284C7"
                        className="mb-2"
                      />
                      <div className="fw-semibold" style={{ color: "#0F3B5D" }}>
                        Direct Support
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div
                      className="p-3 rounded-3 h-100"
                      style={{ backgroundColor: "#F8FAFC" }}
                    >
                      <Clock size={20} color="#0284C7" className="mb-2" />
                      <div className="fw-semibold" style={{ color: "#0F3B5D" }}>
                        Quick Response
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div
                      className="p-3 rounded-3 h-100"
                      style={{ backgroundColor: "#F8FAFC" }}
                    >
                      <ShieldCheck size={20} color="#0284C7" className="mb-2" />
                      <div className="fw-semibold" style={{ color: "#0F3B5D" }}>
                        Candidate Support
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
