import "./globals.css";

import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "MTacademy | PMA Mock Test Platform",
  description:
    "MTacademy official preparation portal for PMA Long Course: Verbal Intelligence, Non-Verbal Intelligence, and Academic Mock Examinations.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
        />
      </head>

      <body>
        <AuthProvider>
          <ToastProvider>
            {/* Navbar is global and appears on every page */}
            <Navbar />

            {children}
          </ToastProvider>
        </AuthProvider>

        <script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
          async
        />
      </body>
    </html>
  );
}
