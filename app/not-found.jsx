import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen d-flex align-items-center justify-content-center bg-light text-center p-4">
      <div className="card shadow-sm p-5 border-0 bg-white" style={{ maxWidth: "480px" }}>
        <h1 className="display-4 fw-bold text-primary mb-2">404</h1>
        <h5 className="fw-semibold text-dark mb-3">Page Not Found</h5>
        <p className="text-secondary small mb-4">
          The requested examination page does not exist or has been moved.
        </p>
        <Link href="/" className="btn btn-primary">
          Return to Portal Home
        </Link>
      </div>
    </div>
  );
}
